import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import {
  CommentType,
  PostType,
  UserType,
  InteractionType,
  NotificationType,
  UserCallback,
} from "../models";
import {
  InteractionDocument,
  NotificationDocument,
  ReportDocument,
  ServerTimestamp,
} from "../models/document-models";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD98rn8YdEp3956xBCdRCsqBxxF6GyvD38",
  authDomain: "yasm-a0f22.firebaseapp.com",
  projectId: "yasm-a0f22",
  storageBucket: "yasm-a0f22.appspot.com",
  messagingSenderId: "193645775751",
  appId: "1:193645775751:web:09e5f4f2b027dc2cbda122",
  measurementId: "G-139TFVTM94",
};

firebase.initializeApp(FIREBASE_CONFIG);

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const increment = (i: number = 1) =>
  firebase.firestore.FieldValue.increment(i);
export const decrement = (i: number = -1) =>
  firebase.firestore.FieldValue.increment(i);
export type CollectionReference = firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;
export type DocumentReference = firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>;
export type QuerySnapshot = firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>;

/**
 * Returns the firebase synced timestamp
 */
export function getServerTimestamp() {
  return (firebase.firestore.FieldValue.serverTimestamp() as unknown) as ServerTimestamp;
}

/**
 * Returns a user
 * @param id User id
 */
export function getUserWithId(id: string): Promise<UserType> {
  return firestore
    .doc(`users/${id}`)
    .get()
    .then((doc) => {
      if (!doc) {
        throw new Error("No user found");
      }
      const user = doc.data() as UserType;
      user._id = doc.id;
      user._ref = doc;
      return user;
    });
}

/**
 * Subscribes to the user document updating the state in real time.
 * @param setState Callback function to update component state
 * @param id the user _id
 */
export function subscribeToUserWithId(setState: UserCallback, id: string) {
  firestore.doc(`users/${id}`).onSnapshot((snapshot) => {
    if (!snapshot.exists) throw new Error("No user found");
    const user = snapshot.data() as UserType;
    user._id = snapshot.id;
    user._ref = snapshot;
    setState(user);
  });
}

/**
 * Returns a user from their at
 * @param at The user's at id
 */
export function getUserWithTheirAt(at: string) {
  return firestore
    .collection("users")
    .where("at", "==", at)
    .limit(1)
    .get()
    .then((querySnapshot) => {
      let user: UserType | undefined;
      querySnapshot.forEach((doc) => {
        user = doc.data() as UserType;
        user._id = doc.id;
        user._ref = doc;
      });

      if (!user) throw new Error(`No user found with the at ${at}`);

      return user;
    });
}

export function subscribeToUserWithTheirAt(
  setState: (T: UserType) => void,
  at: string
) {
  firestore
    .collection("users")
    .where("at", "==", at)
    .limit(1)
    .onSnapshot((querySnapshot) => {
      let user: UserType | undefined;
      querySnapshot.forEach((doc) => {
        user = doc.data() as UserType;
        user._id = doc.id;
        user._ref = doc;
      });

      if (!user) throw new Error(`No user found with the at ${at}`);

      setState(user);
    });
}

/**
 * Returns any interactions the current user has had with the comment or post.
 * @param doc Either post or comment
 * @param user Current user
 * @param setState The set state functiont to update the component
 */
export function subscribeToInteractionWith(
  doc: PostType | CommentType,
  user: UserType,
  setState: (interaction: InteractionType) => void
) {
  return firestore
    .doc(`interactions/${user._id}_${doc._id}`)
    .onSnapshot((docSnap) => {
      const interaction = docSnap.data() as InteractionType;
      if (!interaction) return null;
      interaction._id = docSnap.id;
      interaction._ref = docSnap;
      setState(interaction);
    });
}

/**
 * Returns the interaction where the user has bookmarked the post.
 * @param post Post
 * @param user current user
 */
export function bookmarkPost(post: PostType, user: UserType) {
  const interaction: InteractionDocument = {
    whoInteracted: user._id,
    withWhat: post._id,
    createdAt: getServerTimestamp(),
    bookmarked: true,
  };
  writeNotification(user._id, `@${user.at} has bookmarked your post.`, post);
  return firestore
    .doc(`interactions/${user._id}_${post._id}`)
    .set(interaction, { merge: true });
}

/**
 * Adds a report on a comment or post
 * @param user The user filing the report
 * @param document The thing being reported
 * @param text Why its rude
 */
export function fileReport(
  user: UserType,
  doc: PostType | CommentType,
  text: string
) {
  // add the report
  const report: ReportDocument = {
    reported: doc._id,
    reportedBy: user._id,
    text: text,
    createdAt: getServerTimestamp(),
  };
  const reportPromise = firestore
    .doc(`reports/${user._id}_${doc._id}`)
    .set(report, { merge: true })
    .then((data) => {
      console.log("Report filed");
      return data;
    })
    .catch((error) => {
      console.log({ error });
    });

  // add the interaction
  const interaction: InteractionDocument = {
    whoInteracted: user._id,
    withWhat: doc._id,
    report: text,
    createdAt: getServerTimestamp(),
  };
  const interactionPromise = firestore
    .doc(`interactions/${user._id}_${doc._id}`)
    .set(interaction, { merge: true });

  // notify author of report
  writeNotification(
    user._id,
    `@${user.at} has reported a post or comment for being rude.`,
    doc
  );

  return Promise.all([reportPromise, interactionPromise]);
}

export function updateUser(
  userId: string,
  name: string,
  at: string
): Promise<void> {
  // make sure no other user has the at
  return new Promise((resolve, reject) => {
    atIsUnique(at).then((isUnique) => {
      if (!isUnique) reject({ message: "Your at is not unique" });
      firestore
        .doc(`users/${userId}`)
        .update({ name, at })
        .then(() => resolve())
        .catch((error) => reject(error));
    });
  });
}

export function updateBio(userId: string, bio: string) {
  return firestore.doc(`users/${userId}`).update({ bio });
}

export function updateLinks(userId: string, links: string[]) {
  return firestore.doc(`users/${userId}`).update({ links });
}

export function atIsUnique(at: string) {
  return firestore
    .collection("users")
    .where("at", "==", at)
    .limit(1)
    .get()
    .then((doc) => {
      let exists = false;
      doc.forEach((d) => {
        if (!exists) exists = true;
      });
      return !exists;
    });
}

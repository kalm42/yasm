import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { CommentType, UserType } from "../models";

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

export function getServerTimestamp() {
  return firebase.firestore.FieldValue.serverTimestamp();
}

export function updateDocument(path: string, value: object) {
  return firestore.doc(path).set(value, { merge: true });
}

export function getUserWithUID(uid: string): Promise<UserType | null> {
  return firestore
    .doc(`users/${uid}`)
    .get()
    .then((doc) => {
      const user = doc.data() || null;
      if (user) {
        user.uid = doc.id;
      }
      return user as UserType;
    });
}

export function getUserWithId(id: string): Promise<UserType | null> {
  return firestore
    .collection("users")
    .where("id", "==", id)
    .get()
    .then((querySnapshot) => {
      let document: firebase.firestore.DocumentData | null = null;
      querySnapshot.forEach((doc) => {
        document = doc.data();
        document.uid = doc.id;
      });

      return document ? (document as UserType) : null;
    });
}

export function followUser(follower: firebase.User, followed: UserType) {
  const path = `follows/${follower.uid}_${followed.uid}`;

  return firestore.doc(path).set({
    createdAt: getServerTimestamp(),
    follower: follower.uid,
    followed: followed.uid,
  });
}

export function unfollowUser(follower: firebase.User, followed: UserType) {
  const path = `follows/${follower.uid}_${followed.uid}`;
  return firestore.doc(path).delete();
}

export function doesFollow(follower: firebase.User, followed: UserType) {
  const path = `follows/${follower.uid}_${followed.uid}`;
  return firestore
    .doc(path)
    .get()
    .then((doc) => doc.exists);
}

type CollectionReference = firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;

export function writeComment(
  collectionRef: CollectionReference,
  comment: CommentType,
  postId: string
) {
  collectionRef.doc(postId).collection("comments").add(comment);
}

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import {
  CommentType,
  PostType,
  UserType,
  FollowType,
  InteractionType,
  NewComment,
  NewReport,
  NewInteraction,
} from "../models";

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
export interface ServerTimestamp {
  // https://firebase.google.com/docs/reference/android/com/google/firebase/Timestamp
  seconds: number;
  nanoseconds: number;
  compareTo: (s: ServerTimestamp) => number;
  describeContents: () => number;
  equals: (s: Object) => boolean;
  getNanoseconds: () => number;
  getSeconds: () => number;
  hashCode: () => number;
  now: () => ServerTimestamp;
  toDate: () => Date;
  toString: () => string;
}
export type CollectionReference = firebase.firestore.CollectionReference<firebase.firestore.DocumentData>;
export type DocumentReference = firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>;
type QuerySnapshot = firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>;
type QueryDocumentSnapshot = firebase.firestore.QueryDocumentSnapshot<firebase.firestore.DocumentData>;

export function getServerTimestamp() {
  return (firebase.firestore.FieldValue.serverTimestamp() as unknown) as ServerTimestamp;
}

export function updateDocument(path: string, value: object) {
  return firestore.doc(path).set(value, { merge: true });
}

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

export function followUser(follower: UserType, followed: UserType) {
  const path = `follows/${follower._id}_${followed._id}`;

  return firestore.doc(path).set({
    createdAt: getServerTimestamp(),
    follower: follower._id,
    followed: followed._id,
  });
}

export function unfollowUser(follower: UserType, followed: UserType) {
  const path = `follows/${follower._id}_${followed._id}`;
  return firestore.doc(path).delete();
}

export function doesFollow(followerId: string, followedId: string) {
  const path = `follows/${followerId}_${followedId}`;
  return firestore
    .doc(path)
    .get()
    .then((doc) => doc.exists);
}

export function writeComment(
  user: UserType,
  post: PostType,
  comment: string,
  parentComment?: CommentType
) {
  const newComment: NewComment = {
    authorId: user._id,
    commentCount: 0,
    createdAt: getServerTimestamp(),
    level: 0,
    score: 0,
    text: comment,
  };
  if (parentComment) {
    newComment.parentId = parentComment._id;
    newComment.level = parentComment.level + 1;
  }
  firestore.doc(`posts/${post._id}`).collection("comments").add(newComment);
  // update post comment count
  post._ref.ref.set(
    { commentCount: (post.commentCount || 0) + 1 },
    { merge: true }
  );
  // update parent comment comment count
  if (parentComment) {
    parentComment._ref.ref.set(
      { commentCount: (parentComment.commentCount || 0) + 1 },
      { merge: true }
    );
  }
}

export function getCollection(path: string) {
  return firestore.collection(path);
}

/**
 * Returns a single post object as determined by the id
 * @param documentId The document id of a post
 */
export function getPostByDocId(documentId: string) {
  return firestore
    .doc(`posts/${documentId}`)
    .get()
    .then((doc) => {
      const post: PostType = doc.data() as PostType;
      post._id = doc.id;
      post._ref = doc;
      return post;
    });
}

/**
 * Returns an array of properly prepared comment objects.
 * @param query A query for comments
 */
function aggregateComments(query: QuerySnapshot) {
  const commentCollection: CommentType[] = [];
  query.forEach((doc) => {
    const comment = doc.data() as CommentType;
    comment._ref = doc;
    comment._id = doc.id;
    commentCollection.push(comment);
  });
  return commentCollection;
}

/**
 * Returns the latest 25 top level comments on a post.
 * @param postId The document id of the post
 * @param level The depth of the conversation thread to return
 */
export function getCommentsForPost(postId: string, level: number = 0) {
  return firestore
    .collection(`posts/${postId}/comments`)
    .where("level", "==", level)
    .orderBy("createdAt", "desc")
    .limit(25)
    .get()
    .then(aggregateComments);
}

/**
 * Returns the latest 25 replies to a comment
 * @param postId The document id of the post
 * @param commentId The document id of the comment
 * @param level The depth of the conversation thread
 */
export function getRepliesToComment(
  postId: string,
  commentId: string,
  level: number = 1
) {
  return firestore
    .collection(`posts/${postId}/comments`)
    .where("level", "==", level)
    .where("parentId", "==", commentId)
    .orderBy("createdAt", "desc")
    .limit(25)
    .get()
    .then(aggregateComments);
}

/**
 * Returns an array of user ids that the current user is following.
 * @param userId The uid of the user
 */
export function getFollowers(userId: string) {
  return firestore
    .collection("follows")
    .where("follower", "==", userId)
    .get()
    .then((querySnapshot) => {
      const follows: string[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FollowType;
        follows.push(data.followed);
      });
      follows.push(userId);
      return follows;
    });
}

/**
 * Returns an array of posts appropriately formated.
 * @param query A post query snapshot
 */
function aggregatePosts(query: QuerySnapshot) {
  const postCollection: PostType[] = [];
  query.forEach((doc) => {
    const post = doc.data() as PostType;
    post._id = doc.id;
    post._ref = doc;
    postCollection.push(post);
  });
  return postCollection;
}

/**
 * Returns an array of posts from the users that the current user is following.
 * @param followedUserIds Array of user ids the current user follows
 */
export function getMyFeed(followedUserIds: string[]) {
  return firestore
    .collection("posts")
    .where("authorId", "in", followedUserIds)
    .orderBy("createdAt", "desc")
    .limit(25)
    .get()
    .then(aggregatePosts);
}

/**
 * Returns an array of posts that the current user has bookmarked.
 * @param userId The uid of the current user
 */
export function getMyBookmarks(userId: string) {
  return firestore
    .collection("interactions")
    .where("bookmarked", "==", true)
    .where("whoInteracted", "==", userId)
    .get()
    .then((querySnapshot) => {
      const postIds: string[] = [];
      querySnapshot.forEach((doc) => {
        const interaction = doc.data() as InteractionType;
        postIds.push(interaction.withWhat);
      });
      return getPostsByIds(postIds);
    });
}

/**
 * Returns an array of posts as specified from the array
 * @param postIds An array of post ids
 */
export function getPostsByIds(postIds: string[]) {
  return firestore
    .collection("posts")
    .where(firebase.firestore.FieldPath.documentId(), "in", postIds)
    .get()
    .then(aggregatePosts);
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

/**
 * Reduces the score of a post or a comment by 1
 * @param doc Either a post or a comment
 * @param user The current user
 */
export function decrementScore(doc: PostType | CommentType, user: UserType) {
  const updateScore = doc._ref.ref.set(
    { score: doc.score - 1 },
    { merge: true }
  );
  const interaction: NewInteraction = {
    vote: false,
    whoInteracted: user._id,
    withWhat: doc._id,
    createdAt: getServerTimestamp(),
  };
  const recordInteraction = firestore
    .doc(`interactions/${user._id}_${doc._id}`)
    .set(interaction, { merge: true });

  return Promise.all([updateScore, recordInteraction]);
}

/**
 * Increases the score of a post or a comment by 1
 * @param doc Either a post or a comment
 * @param user The current user
 */
export function incrementScore(doc: PostType | CommentType, user: UserType) {
  const updateScore = doc._ref.ref.set(
    { score: doc.score + 1 },
    { merge: true }
  );
  const interaction: NewInteraction = {
    vote: true,
    whoInteracted: user._id,
    withWhat: doc._id,
    createdAt: getServerTimestamp(),
  };
  const recordInteraction = firestore
    .doc(`interactions/${user._id}_${doc._id}`)
    .set(interaction, { merge: true });
  return Promise.all([updateScore, recordInteraction]);
}

/**
 * Returns any interactions the current user has had with the comment or post.
 * @param doc Either post or comment
 * @param user Current user
 */
export function getInteractionWith(
  doc: PostType | CommentType,
  user: UserType
) {
  return firestore
    .doc(`interactions/${user._id}_${doc._id}`)
    .get()
    .then((doc) => {
      const interaction = doc.data() as InteractionType;
      if (!interaction) return null;
      interaction._id = doc.id;
      interaction._ref = doc;
      return interaction;
    });
}

/**
 * Returns the interaction where the user has bookmarked the post.
 * @param post Post
 * @param user current user
 */
export function bookmarkPost(post: PostType, user: UserType) {
  const interaction: NewInteraction = {
    whoInteracted: user._id,
    withWhat: post._id,
    createdAt: getServerTimestamp(),
    bookmarked: true,
  };
  return firestore
    .doc(`interactions/${user._id}_${post._id}`)
    .set(interaction, { merge: true });
}

export function fileReport(
  user: UserType,
  document: PostType | CommentType,
  text: string
) {
  // add the report
  const report: NewReport = {
    reported: document._id,
    reportedBy: user._id,
    text: text,
    createdAt: getServerTimestamp(),
  };
  const reportPromise = firestore
    .doc(`reports/${user._id}_${document._id}`)
    .set(report, { merge: true })
    .then((data) => {
      console.log("Report filed");
      return data;
    })
    .catch((error) => {
      console.log({ error });
    });

  // add the interaction
  const interaction: NewInteraction = {
    whoInteracted: user._id,
    withWhat: document._id,
    report: text,
    createdAt: getServerTimestamp(),
  };
  const interactionPromise = firestore
    .doc(`interactions/${user._id}_${document._id}`)
    .set(interaction, { merge: true });

  return Promise.all([reportPromise, interactionPromise]);
}

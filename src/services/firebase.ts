import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import {
  CommentType,
  PostType,
  UserType,
  FollowType,
  InteractionType,
  NotificationType,
  UserCallback,
  CommentsCallback,
  PostDocument,
} from "../models";
import {
  CommentDocument,
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
type QuerySnapshot = firebase.firestore.QuerySnapshot<firebase.firestore.DocumentData>;

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
 * Sets a relationship between two users
 * @param follower User that is following
 * @param followed User that is being followed
 */
export function followUser(follower: UserType, followed: UserType) {
  const path = `follows/${follower._id}_${followed._id}`;

  writeNotification(followed._id, `@${follower.at} has followed you.`);

  // update follower's following count
  firestore
    .doc(`users/${follower._id}`)
    .update({ followingCount: increment() });
  // update followed's follower count
  firestore.doc(`users/${followed._id}`).update({ followerCount: increment() });

  return firestore.doc(path).set({
    createdAt: getServerTimestamp(),
    follower: follower._id,
    followed: followed._id,
  });
}

/**
 * Destroys a relations between two users
 * @param follower User that is following
 * @param followed User that is being un-followed
 */
export function unfollowUser(follower: UserType, followed: UserType) {
  // update follower's following count
  firestore
    .doc(`users/${follower._id}`)
    .update({ followingCount: decrement() });
  // update followed's follower count
  firestore.doc(`users/${followed._id}`).update({ followerCount: decrement() });

  const path = `follows/${follower._id}_${followed._id}`;
  writeNotification(followed._id, `@${follower.at} has stoped following you.`);
  return firestore.doc(path).delete();
}

/**
 * Returns if a user follows another user.
 * @param followerId User that is following
 * @param followedId User that is being followed
 */
export function doesFollow(followerId: string, followedId: string) {
  const path = `follows/${followerId}_${followedId}`;
  return firestore
    .doc(path)
    .get()
    .then((doc) => doc.exists);
}

/**
 * Adds a comment to the post.
 * @param user The user writing the comment
 * @param post The post the comment relates to
 * @param comment The text of the comment
 * @param parentComment The comment the new comment relates to
 */
export function writeComment(
  user: UserType,
  post: PostType,
  comment: string,
  parentComment?: CommentType
) {
  // Assemble comment document
  const newComment: CommentDocument = {
    authorId: user._id,
    commentCount: 0,
    createdAt: getServerTimestamp(),
    level: 0,
    score: 0,
    text: comment,
  };

  // conditionally add parent comment info
  if (parentComment) {
    newComment.parentId = parentComment._id;
    newComment.level = parentComment.level + 1;
  }

  // Notify post author of new comment.
  writeNotification(
    post.authorId,
    `@${user.at} has commented on your post.`,
    post
  );

  // add document to db
  firestore.doc(`posts/${post._id}`).collection("comments").add(newComment);

  // update post comment count
  post._ref.ref.update({ commentCount: increment() });

  // conditionally update parent comment comment count and notify author
  if (parentComment) {
    // notify parent comment author of reply
    writeNotification(
      parentComment.authorId,
      `@${user.at} has replied to your comment.`,
      parentComment
    );
    parentComment._ref.ref.update({ commentCount: increment() });
  }
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

export function subscribeToComments(
  postId: string,
  level: number = 0,
  setState: CommentsCallback
) {
  return firestore
    .collection(`posts/${postId}/comments`)
    .where("level", "==", level)
    .orderBy("createdAt", "desc")
    .limit(10)
    .onSnapshot((querySnapshot) => {
      setState(aggregateComments(querySnapshot));
    });
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

export function subscribeToReplies(
  setState: (T: CommentType[]) => void,
  postId: string,
  commentId: string,
  level: number = 1
) {
  return firestore
    .collection(`/posts/${postId}/comments`)
    .where("level", "==", level)
    .where("parentId", "==", commentId)
    .orderBy("createdAt", "desc")
    .limit(10)
    .onSnapshot((querySnapshot) => {
      setState(aggregateComments(querySnapshot));
    });
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
 * @param setState The set state functiont to update the component
 */
export function subscribeToMyFeed(
  followedUserIds: string[],
  setState: (posts: PostType[]) => void
) {
  return firestore
    .collection("posts")
    .where("authorId", "in", followedUserIds)
    .orderBy("createdAt", "desc")
    .limit(25)
    .onSnapshot((querySnapshot) => {
      setState(aggregatePosts(querySnapshot));
    });
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
 * Reduces the score of a post or a comment by 1
 * @param doc Either a post or a comment
 * @param user The current user
 */
export function decrementScore(doc: PostType | CommentType, user: UserType) {
  // Decrement the post or comment score
  const decrementScore = doc._ref.ref.update({ score: decrement() });

  // decrement author's score
  const decrementAuthor = firestore
    .doc(`users/${doc.authorId}`)
    .update({ score: decrement() });

  // record the interaction
  const interaction: InteractionDocument = {
    vote: false,
    whoInteracted: user._id,
    withWhat: doc._id,
    createdAt: getServerTimestamp(),
  };

  const recordInteraction = firestore
    .doc(`interactions/${user._id}_${doc._id}`)
    .set(interaction, { merge: true });

  return Promise.all([decrementScore, decrementAuthor, recordInteraction]);
}

/**
 * Reduces the score of a post or a comment by 1
 * @param doc Either a post or a comment
 * @param user The current user
 */
export function undecrementScore(doc: PostType | CommentType, user: UserType) {
  // incremeny post or comment score
  const updateScore = doc._ref.ref.update({ score: increment() });

  // increment author's score
  const updateAuthor = firestore
    .doc(`users/${doc.authorId}`)
    .update({ score: increment() });

  // delete vote
  const recordInteraction = firestore
    .doc(`interactions/${user._id}_${doc._id}`)
    .update({
      vote: firebase.firestore.FieldValue.delete(),
    });

  return Promise.all([updateScore, updateAuthor, recordInteraction]);
}

export function switchDownVoteToUpVote(
  doc: PostType | CommentType,
  user: UserType
) {
  // update document's score
  const updateScore = doc._ref.ref.update({ score: increment(2) });

  // update author's score
  const updateAuthor = firestore
    .doc(`users/${doc.authorId}`)
    .update({ score: increment(2) });

  // update interaction
  const recordInteraction = firestore
    .doc(`interactions/${user._id}_${doc._id}`)
    .update({ vote: true });

  return Promise.all([updateScore, updateAuthor, recordInteraction]);
}

/**
 * Increases the score of a post or a comment by 1
 * @param doc Either a post or a comment
 * @param user The current user
 */
export function incrementScore(doc: PostType | CommentType, user: UserType) {
  // increment post or comment score
  const updateScore = doc._ref.ref.update({ score: increment() });

  // increment author's score
  const updateAuthor = firestore
    .doc(`users/${doc.authorId}`)
    .update({ score: increment() });

  // record interaction
  const interaction: InteractionDocument = {
    vote: true,
    whoInteracted: user._id,
    withWhat: doc._id,
    createdAt: getServerTimestamp(),
  };
  const recordInteraction = firestore
    .doc(`interactions/${user._id}_${doc._id}`)
    .set(interaction, { merge: true });
  return Promise.all([updateScore, updateAuthor, recordInteraction]);
}

/**
 * Increases the score of a post or a comment by 1
 * @param doc Either a post or a comment
 * @param user The current user
 */
export function unincrementScore(doc: PostType | CommentType, user: UserType) {
  // decrement the post or comment score
  const updateScore = doc._ref.ref.update({ score: decrement() });

  // decrement the author's score
  const updateAuthor = firestore
    .doc(`users/${doc.authorId}`)
    .update({ score: decrement() });

  // Update interaction
  const recordInteraction = firestore
    .doc(`interactions/${user._id}_${doc._id}`)
    .update({ vote: firebase.firestore.FieldValue.delete() });

  return Promise.all([updateScore, updateAuthor, recordInteraction]);
}

export function switchUpVoteToDownVote(
  doc: PostType | CommentType,
  user: UserType
) {
  // update document's score
  const updateScore = doc._ref.ref.update({ score: decrement(2) });

  // update author's score
  const updateAuthor = firestore
    .doc(`users/${doc.authorId}`)
    .update({ score: decrement(2) });

  // update interaction
  const recordInteraction = firestore
    .doc(`interactions/${user._id}_${doc._id}`)
    .update({ vote: false });

  return Promise.all([updateScore, updateAuthor, recordInteraction]);
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

/**
 * Returns a feed not filtered by followers
 * @param setState The set state functiont to update the component
 */
export function subscribeToAnonFeed(setState: (posts: PostType[]) => void) {
  return firestore
    .collection("posts")
    .orderBy("createdAt", "desc")
    .limit(25)
    .onSnapshot((querSnapshot) => {
      setState(aggregatePosts(querSnapshot));
    });
}

/**
 * Returns an array of notifications
 * @param query Firestore notification quert
 */
function aggregateNotifications(query: QuerySnapshot) {
  const notificationCollection: NotificationType[] = [];
  query.forEach((doc) => {
    const notification = doc.data() as NotificationType;
    notification._id = doc.id;
    notification._ref = doc;
    notificationCollection.push(notification);
  });
  return notificationCollection;
}

/**
 * Returns an array of the user's notifications
 * @param user Current user
 */
export function getMyNotifications(user: UserType) {
  return firestore
    .collection("notifications")
    .where("userId", "==", user._id)
    .where("hasRead", "==", false)
    .orderBy("createdAt", "desc")
    .limit(25)
    .get()
    .then(aggregateNotifications);
}

/**
 * Adds a notification for a user
 * @param user user to notifiy
 * @param doc Post or comment it relates to
 * @param text Message for the user
 */
export function writeNotification(
  userId: string,
  text: string,
  doc?: PostType | CommentType
) {
  const notification: NotificationDocument = {
    createdAt: getServerTimestamp(),
    hasRead: false,
    message: text,
    userId: userId,
  };
  if (doc) {
    notification.reference = doc._id;
  }
  return firestore.collection("notifications").add(notification);
}

export function updateNotifications(notifications: NotificationType[]) {
  const batch = firestore.batch();
  notifications.forEach((notification) => {
    batch.update(notification._ref.ref, { hasRead: true });
  });
  batch.commit();
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

export function createPost(authorId: string, text: string) {
  // assemble post
  const post: PostDocument = {
    authorId,
    commentCount: 0,
    createdAt: getServerTimestamp(),
    score: 0,
    text,
  };

  // record post
  firestore.collection("posts").add(post);

  // update author's post count
  return firestore.doc(`users/${authorId}`).update({ postCount: increment() });
}

export function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
}

export function signOut() {
  auth.signOut();
}

export function subscribeToAuth(setState: (T: UserType | null) => void) {
  firebase.auth().onAuthStateChanged((googleUser) => {
    if (googleUser) {
      subscribeToUserWithId(setState, googleUser.uid);
    } else {
      setState(null);
    }
  });
}

import firebase from "firebase/app";
import { firestore, getServerTimestamp, increment } from ".";
import { InteractionType, PostDocument, PostType } from "../models";
import { QuerySnapshot } from "./firebase";

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

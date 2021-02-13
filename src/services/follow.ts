import {
  decrement,
  firestore,
  getServerTimestamp,
  increment,
  writeNotification,
} from ".";
import { FollowType, UserType } from "../models";

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

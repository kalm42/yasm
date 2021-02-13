import firebase from "firebase/app";
import {
  CommentType,
  InteractionDocument,
  PostType,
  UserType,
} from "../models";
import {
  decrement,
  firestore,
  getServerTimestamp,
  increment,
} from "./firebase";

/**
 * Increases the score of a post or a comment by 1
 * @param doc Either a post or a comment
 * @param user The current user
 */
export function incrementScore(doc: PostType | CommentType, user: UserType) {
  const batch = firestore.batch();

  // increment post or comment score
  batch.update(doc._ref.ref, { score: increment() });

  // increment author's score
  const author = firestore.doc(`users/${doc.authorId}`);
  batch.update(author, { score: increment() });

  // record interaction
  const _interaction: InteractionDocument = {
    vote: true,
    whoInteracted: user._id,
    withWhat: doc._id,
    createdAt: getServerTimestamp(),
  };
  const interaction = firestore.doc(`interactions/${user._id}_${doc._id}`);
  batch.set(interaction, _interaction, { merge: true });

  return batch.commit();
}

/**
 * Increases the score of a post or a comment by 1
 * @param doc Either a post or a comment
 * @param user The current user
 */
export function unincrementScore(doc: PostType | CommentType, user: UserType) {
  const batch = firestore.batch();

  // decrement the post or comment score
  batch.update(doc._ref.ref, { score: decrement() });

  // decrement the author's score
  const author = firestore.doc(`users/${doc.authorId}`);
  batch.update(author, { score: decrement() });

  // Update interaction
  const recordInteraction = firestore.doc(
    `interactions/${user._id}_${doc._id}`
  );

  batch.update(recordInteraction, {
    vote: firebase.firestore.FieldValue.delete(),
  });

  return batch.commit();
}

export function switchUpVoteToDownVote(
  doc: PostType | CommentType,
  user: UserType
) {
  const batch = firestore.batch();

  // update document's score
  batch.update(doc._ref.ref, { score: decrement(2) });

  // update author's score
  const author = firestore.doc(`users/${doc.authorId}`);
  batch.update(author, { score: decrement(2) });

  // update interaction
  const recordInteraction = firestore.doc(
    `interactions/${user._id}_${doc._id}`
  );
  batch.update(recordInteraction, { vote: false });

  return batch.commit();
}

/**
 * Reduces the score of a post or a comment by 1
 * @param doc Either a post or a comment
 * @param user The current user
 */
export function decrementScore(doc: PostType | CommentType, user: UserType) {
  const batch = firestore.batch();

  // Decrement the post or comment score
  batch.update(doc._ref.ref, { score: decrement() });

  // decrement author's score
  const author = firestore.doc(`users/${doc.authorId}`);
  batch.update(author, { score: decrement() });

  // record the interaction
  const _interaction: InteractionDocument = {
    vote: false,
    whoInteracted: user._id,
    withWhat: doc._id,
    createdAt: getServerTimestamp(),
  };

  const interactionRef = firestore.doc(`interactions/${user._id}_${doc._id}`);
  batch.set(interactionRef, _interaction, { merge: true });

  return batch.commit();
}

/**
 * Reduces the score of a post or a comment by 1
 * @param doc Either a post or a comment
 * @param user The current user
 */
export function undecrementScore(doc: PostType | CommentType, user: UserType) {
  const batch = firestore.batch();

  // incremeny post or comment score
  batch.update(doc._ref.ref, { score: increment() });

  // increment author's score
  const author = firestore.doc(`users/${doc.authorId}`);
  batch.update(author, { score: increment() });

  // delete vote
  const recordInteraction = firestore.doc(
    `interactions/${user._id}_${doc._id}`
  );
  batch.update(recordInteraction, {
    vote: firebase.firestore.FieldValue.delete(),
  });

  return batch.commit();
}

/**
 * Switches the down vote to an upvote for a comment or post
 * @param doc Post or Comment being voted
 * @param user The user voting
 */
export function switchDownVoteToUpVote(
  doc: PostType | CommentType,
  user: UserType
) {
  const batch = firestore.batch();
  // update document's score
  batch.update(doc._ref.ref, { score: increment(2) });

  // update author's score
  const updateAuthor = firestore.doc(`users/${doc.authorId}`);
  batch.update(updateAuthor, { score: increment(2) });

  // update interaction
  const recordInteraction = firestore.doc(
    `interactions/${user._id}_${doc._id}`
  );
  batch.update(recordInteraction, { vote: true });

  return batch.commit();
}

import { firestore, getServerTimestamp, increment, writeNotification } from ".";
import { QuerySnapshot } from "./firebase";
import {
  CommentDocument,
  CommentsCallback,
  CommentType,
  PostType,
  UserType,
} from "../models";

/**
 * Adds a comment to the post.
 * @param user The user writing the comment
 * @param post The post the comment relates to
 * @param comment The text of the comment
 * @param parentComment The comment the new comment relates to
 */
export async function writeComment(
  user: UserType,
  post: PostType,
  comment: string,
  parentComment?: CommentType
) {
  const batch = firestore.batch();

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
  const author = post.authorId;
  const message = `@${user.at} has commented on your post.`;
  writeNotification(author, message, post);

  // add document to db
  await firestore
    .doc(`posts/${post._id}`)
    .collection("comments")
    .add(newComment);

  // update post comment count
  batch.update(post._ref.ref, { commentCount: increment() });

  // conditionally update parent comment comment count and notify author
  if (parentComment) {
    // notify parent comment author of reply
    const pAuthor = parentComment.authorId;
    const _message = `@${user.at} has replied to your comment.`;
    writeNotification(pAuthor, _message, parentComment);
    batch.update(parentComment._ref.ref, { commentCount: increment() });
  }
  return batch.commit();
}

function getCommentRef(postId: string, level: number) {
  return firestore
    .collection(`posts/${postId}/comments`)
    .where("level", "==", level)
    .orderBy("createdAt", "desc")
    .limit(10);
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
  return getCommentRef(postId, level).onSnapshot((querySnapshot) => {
    setState(aggregateComments(querySnapshot));
  });
}

/**
 * Returns the latest 25 top level comments on a post.
 * @param postId The document id of the post
 * @param level The depth of the conversation thread to return
 */
export function getCommentsForPost(postId: string, level: number = 0) {
  return getCommentRef(postId, level).get().then(aggregateComments);
}

function getRepliesRef(postId: string, commentId: string, level: number) {
  return firestore
    .collection(`posts/${postId}/comments`)
    .where("level", "==", level)
    .where("parentId", "==", commentId)
    .orderBy("createdAt", "desc")
    .limit(10);
}

export function subscribeToReplies(
  setState: (T: CommentType[]) => void,
  postId: string,
  commentId: string,
  level: number = 1
) {
  return getRepliesRef(postId, commentId, level).onSnapshot((querySnapshot) => {
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
  return getRepliesRef(postId, commentId, level).get().then(aggregateComments);
}

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/react";
import { useUser } from "../context";
import { CommentType, PostType, UserType } from "../models";
import { getUserWithId, subscribeToReplies } from "../services/firebase";
import styles from "./Comment.module.css";
import Header from "./Header";
import Footer from "./Footer";

interface Props {
  comment: CommentType;
  post: PostType;
}
const Comment = (props: Props) => {
  const { comment, post } = props;
  const [comments, setComments] = useState<CommentType[] | null>(null);
  const [author, setAuthor] = useState<UserType | null>(null);
  const { user } = useUser();
  let unsubscribe: (() => void) | null = null;

  const getReplies = async () => {
    try {
      unsubscribe = subscribeToReplies(
        setComments,
        post._id,
        comment._id,
        comment.level + 1
      );
    } catch (error) {
      console.warn("Comment:getReplies", error.message);
    }
  };

  // fetch author details
  useEffect(() => {
    const getAuthor = async () => {
      try {
        setAuthor(await getUserWithId(comment.authorId));
      } catch (error) {
        console.warn("Comment:getAuthor", error.message);
      }
    };
    getAuthor();
  }, [comment]);

  useEffect(() => {
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [unsubscribe]);

  return (
    <Sentry.ErrorBoundary fallback={FallbackComment}>
      <section className={styles.root}>
        <Header author={author} />
        <p>{comment.text}</p>
        <Footer disabled={!user} post={post} comment={comment} />
        <section>
          {!!comment.commentCount && (
            <>
              <button onClick={getReplies} className={styles.next}>
                View the latest{" "}
                {comment.commentCount > 10 ? "10" : comment.commentCount} of{" "}
                {comment.commentCount} replies.
              </button>
              {comments?.map((reply) => (
                <Comment comment={reply} post={post} key={reply._id} />
              ))}
            </>
          )}
        </section>
      </section>
    </Sentry.ErrorBoundary>
  );
};

function FallbackComment() {
  return (
    <div>
      <h1>Error: Comment</h1>
      <p>
        An error has occured. Please refresh the page. If the error continues
        please contact support.
      </p>
    </div>
  );
}

export default Comment;

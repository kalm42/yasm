import { faCommentDots } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Sentry from "@sentry/react";
import { useState } from "react";
import { useUser } from "../context";
import { CommentType, PostType } from "../models";
import { writeComment } from "../services/firebase";
import styles from "./WriteComment.module.css";

interface Props {
  post: PostType;
  parentComment?: CommentType;
}
const WriteComment = (props: Props) => {
  const { post, parentComment } = props;
  const { user } = useUser();
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value);
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    if (parentComment) {
      writeComment(user, post, comment, parentComment);
    } else {
      writeComment(user, post, comment, undefined);
    }
    setIsCommenting(false);
    setComment("");
  };
  return (
    <Sentry.ErrorBoundary fallback={FallbackWriteComment}>
      {isCommenting ? (
        <form onSubmit={handleSubmit}>
          <label htmlFor="comment">Comment*:</label>
          <input
            type="text"
            name="comment"
            required
            value={comment}
            onChange={handleChange}
          />
          <button type="submit">✍️</button>
        </form>
      ) : (
        <>
          <button
            onClick={() => setIsCommenting(true)}
            className={styles.button}
          >
            <FontAwesomeIcon icon={faCommentDots} className={styles.icon} />{" "}
            {parentComment ? parentComment.commentCount : post.commentCount}
          </button>
        </>
      )}
    </Sentry.ErrorBoundary>
  );
};

function FallbackWriteComment() {
  return (
    <div>
      <h1>Error: Write Comment</h1>
      <p>
        An error has occured. Please refresh the page. If the error continues
        please contact support.
      </p>
    </div>
  );
}

export default WriteComment;

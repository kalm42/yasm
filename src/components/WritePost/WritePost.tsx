import { FormEvent, useState } from "react";
import * as Sentry from "@sentry/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleUp } from "@fortawesome/free-solid-svg-icons";
import { createPost } from "../../services/firebase";
import { useUser } from "../../context";
import styles from "./WritePost.module.css";

const WritePost = () => {
  const [post, setPost] = useState("");
  const { user } = useUser();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    createPost(user._id, post);
  };

  return (
    <Sentry.ErrorBoundary fallback={FallbackWritePost}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="text"
          value={post}
          placeholder="What's going on?"
          className={styles.input}
          required
          onChange={(e) => setPost(e.target.value)}
        />
        <button type="submit" className={styles.submit}>
          <FontAwesomeIcon icon={faArrowCircleUp} className={styles.icon} />
        </button>
      </form>
    </Sentry.ErrorBoundary>
  );
};

function FallbackWritePost() {
  return (
    <div>
      <h1>Error: Write Post</h1>
      <p>
        An error has occured. Please refresh the page. If the error persists
        please contact support.
      </p>
    </div>
  );
}

export default WritePost;

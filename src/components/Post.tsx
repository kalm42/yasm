import * as Sentry from "@sentry/react";
import { PostType, UserType } from "../models";
import { getUserWithId } from "../services/firebase";
import { useEffect, useState } from "react";
import { useUser } from "../context";
import styles from "./Post.module.css";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Post = (props: PostType) => {
  const { authorId, text } = props;
  const [author, setAuthor] = useState<UserType | null>(null);
  const { user } = useUser();

  // get author's data
  useEffect(() => {
    const getAuthor = async () => {
      console.log("Post:getAuthor");
      try {
        setAuthor(await getUserWithId(authorId));
      } catch (error) {
        console.warn("Post:getAuthor", error.message);
      }
    };
    getAuthor();
  }, [authorId]);

  return (
    <Sentry.ErrorBoundary fallback={FallbackPost}>
      <article className={styles.root}>
        <Header author={author} />
        <Link to={`/post/${props._id}`} className={styles.link}>
          <div className={styles.post}>
            <p>{text}</p>
          </div>
        </Link>
        <Footer disabled={!user} post={props} />
      </article>
    </Sentry.ErrorBoundary>
  );
};

function FallbackPost() {
  return (
    <div>
      <h1>Error: Post</h1>
      <p>
        An error has occured. Please refresh the page. If the problem continues
        please contact support.
      </p>
    </div>
  );
}

export default Post;

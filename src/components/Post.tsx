import * as Sentry from "@sentry/react";
import ProfileImage from "./ProfileImage";
import { PostType, UserType } from "../models";
import { getUserWithId } from "../services/firebase";
import { useEffect, useState } from "react";
import Score from "./Score";
import WriteComment from "./WriteComment";
import { useUser } from "../context";
import styles from "./Post.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

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
        <header className={styles.header}>
          <ProfileImage url={author?.profileImage} userAt={author?.at} />
          <div className={styles.author}>
            <p className={styles.name}>
              {author?.name} @{author?.at}
            </p>
            <p className={styles.time}>10 min ago</p>
          </div>
          <button className={styles.options}>
            <FontAwesomeIcon icon={faEllipsisH} className={styles.icon} />
            {/* 
              // TODO: shove these in the options
              <li className={styles.tool}>
                <Bookmark post={props} interaction={interactions} />
              </li>
              <li className={styles.tool}>
                <Report document={props} />
              </li> 
            */}
          </button>
        </header>
        <Link to={`/post/${props._id}`} className={styles.link}>
          <div className={styles.post}>
            <p>{text}</p>
          </div>
        </Link>
        <footer>
          <fieldset disabled={!user} className={styles.fieldset}>
            <ul className={styles.toolbar}>
              <li className={styles.tool}>
                <Score document={props} />
              </li>
              <li className={styles.tool}>
                <WriteComment post={props} />
              </li>
            </ul>
            {!user && <p>To interact with posts please login.</p>}
          </fieldset>
        </footer>
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

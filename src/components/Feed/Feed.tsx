import * as Sentry from "@sentry/react";
import Post from "../Post";
import { useUser } from "../../context";
import { useEffect, useState } from "react";
import { PostType } from "../../models";
import styles from "./Feed.module.css";
import {
  getFollowers,
  subscribeToAnonFeed,
  subscribeToMyFeed,
} from "../../services";

const Feed = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<PostType[]>([]);

  useEffect(() => {
    let unsubscribe: () => void | undefined;
    const fetchFollows = async () => {
      console.log("running... Feed:fetchFollows");
      setIsLoading(true);
      if (!user) return;
      try {
        unsubscribe = await subscribeToMyFeed(
          await getFollowers(user._id),
          setPosts
        );
      } catch (error) {
        console.warn("Feed:fetchFollows", error.message);
      }
      setIsLoading(false);
    };
    const fetchAnon = async () => {
      console.log("Feed:fetchAnon");
      setIsLoading(true);
      try {
        unsubscribe = await subscribeToAnonFeed(setPosts);
      } catch (error) {
        console.warn("Feed:fetchAnon", error.message);
      }
      setIsLoading(false);
    };
    if (user) {
      fetchFollows();
    } else {
      fetchAnon();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);
  return (
    <Sentry.ErrorBoundary fallback={FallbackFeed}>
      <section>
        <h1 className={styles.title}>the feed</h1>
        {isLoading ? (
          <p>... loading ...</p>
        ) : (
          posts.map((post) => <Post key={post._id} {...post} />)
        )}
      </section>
    </Sentry.ErrorBoundary>
  );
};

function FallbackFeed() {
  return (
    <div>
      <h1>Error: Feed</h1>
      <p>
        An error has occured. Please refresh the page. If the error continues
        please contact support.
      </p>
    </div>
  );
}

export default Feed;

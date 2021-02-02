import * as Sentry from "@sentry/react";
import { getAnonFeed, getFollowers, getMyFeed } from "../services/firebase";
import Post from "./Post";
import { useUser } from "../context";
import { useEffect, useState } from "react";
import { PostType } from "../models";

const Feed = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<PostType[]>([]);

  useEffect(() => {
    const fetchFollows = async () => {
      console.log("running... Feed:fetchFollows");
      setIsLoading(true);
      if (!user) return;
      try {
        setPosts(await getMyFeed(await getFollowers(user._id)));
      } catch (error) {
        console.warn("Feed:fetchFollows", error.message);
      }
      setIsLoading(false);
    };
    const fetchAnon = async () => {
      console.log("Feed:fetchAnon");
      setIsLoading(true);
      try {
        setPosts(await getAnonFeed());
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
  }, [user]);
  return (
    <Sentry.ErrorBoundary fallback={FallbackFeed}>
      <section>
        <h2>the feed</h2>
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

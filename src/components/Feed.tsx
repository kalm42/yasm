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
    <section>
      <h2>the feed</h2>
      {isLoading ? (
        <p>... loading ...</p>
      ) : (
        posts.map((post) => <Post key={post._id} {...post} />)
      )}
    </section>
  );
};

export default Feed;

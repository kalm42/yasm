import { getFollowers, getMyFeed } from "../services/firebase";
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
      setPosts(await getMyFeed(await getFollowers(user._id)));
      setIsLoading(false);
    };
    fetchFollows();
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

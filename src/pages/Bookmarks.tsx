import { useEffect, useState } from "react";
import { useUser } from "../context";
import { PostType } from "../models";
import { getMyBookmarks } from "../services/firebase";
import Post from "../components/Post";

const Bookmarks = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState<PostType[]>([]);
  useEffect(() => {
    const goGet = async () => {
      if (!user) return;
      setPosts(await getMyBookmarks(user._id));
    };
    goGet();
  }, [user]);
  return (
    <div>
      <h1>Bookmarks</h1>
      {posts.map((post) => (
        <Post key={post._id} {...post} />
      ))}
    </div>
  );
};

export default Bookmarks;

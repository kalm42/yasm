import { firestore } from "../services/firebase";
import Post from "./Post";
import { useUser } from "../context";
import { useEffect, useState } from "react";
import { PostType } from "../models";

const Feed = () => {
  const { user } = useUser();
  const [followList, setFollowList] = useState<string[]>([]);
  const [posts, setPosts] = useState<PostType[]>([]);

  useEffect(() => {
    const getFollowed = async () => {
      if (!user) return;
      const followsRef = firestore.collection("follows");
      followsRef
        .where("follower", "==", user?.uid)
        .onSnapshot((querySnapshot) => {
          let follows: string[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            follows.push(data.followed);
          });
          // You want to see your own posts.
          follows.push(user.uid);
          setFollowList(follows);
        });
    };
    getFollowed();
  }, [user]);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    const getPosts = async () => {
      if (!followList.length) return;
      const postsRef = firestore.collection("posts");
      const query = postsRef
        .where("authorId", "in", followList)
        .orderBy("createdAt", "desc")
        .limit(25);
      unsubscribe = query.onSnapshot((querySnapshot) => {
        const p: PostType[] = [];
        querySnapshot.forEach((doc) => {
          const q = doc.data();
          q.id = doc.id;
          p.push(q as PostType);
        });
        setPosts(p);
      });
    };
    getPosts();
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [followList]);

  return (
    <section>
      <h2>the feed</h2>
      {posts.map((post) => (
        <Post key={post.id} {...post} />
      ))}
    </section>
  );
};

export default Feed;

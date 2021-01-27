import { firestore } from "../services/firebase";
import { useCollectionData } from "react-firebase-hooks/firestore";
import Post from "./Post";
import { useUser } from "../context";
import { useEffect, useState } from "react";

interface PostInterface {
  profileImage?: string;
  authorName: string;
  authorId: string;
  text: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  id: string;
}

const Feed = () => {
  const { user } = useUser();
  const [followList, setFollowList] = useState<string[]>([]);
  const [posts, setPosts] = useState<PostInterface[]>([]);
  // get users I follow
  // get posts those users have made

  useEffect(() => {
    const getFollowed = async () => {
      if (!user) return;
      const followsRef = firestore.collection("follows");
      const query = await followsRef
        .where("follower", "==", user?.uid)
        .get()
        .then((querySnapshot) => {
          let follows: string[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            follows.push(data.followed);
          });
          return follows;
        });
      setFollowList(query);
    };
    getFollowed();
  }, [user]);

  useEffect(() => {
    // get posts from those users
    const getPosts = async () => {
      if (!followList.length) return;
      console.log(followList);
      const postsRef = firestore.collection("posts");
      const query = postsRef
        .where("authorId", "in", followList)
        .orderBy("createdAt", "desc")
        .limit(25);
      query.get().then((querySnapshot) => {
        const p: PostInterface[] = [];
        querySnapshot.forEach((doc) => {
          const q = doc.data();
          q.id = doc.id;
          p.push(q as PostInterface);
        });
        setPosts(p);
      });
    };
    getPosts();
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

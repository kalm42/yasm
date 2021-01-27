import { firestore } from "../services/firebase";
import { useCollectionData } from "react-firebase-hooks/firestore";
import Post from "./Post";

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
  const postsRef = firestore.collection("posts");
  const query = postsRef.orderBy("createdAt").limit(25);
  const [posts] = useCollectionData<PostInterface>(query, { idField: "id" });

  if (!posts?.length) return null;

  return (
    <section>
      {posts.map((post) => (
        <Post key={post.id} {...post} />
      ))}
    </section>
  );
};

export default Feed;

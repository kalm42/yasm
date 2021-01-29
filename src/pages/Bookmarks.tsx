import { useEffect, useState } from "react";
import { useUser } from "../context";
import { PostType, InteractionType } from "../models";
import { firestore } from "../services/firebase";
import firebase from "firebase/app";
import Post from "../components/Post";

const Bookmarks = () => {
  const { user } = useUser();
  const [posts, setPosts] = useState<PostType[]>([]);
  useEffect(() => {
    const goGet = () => {
      if (!user) return;
      firestore
        .collection("interactions")
        .where("bookmarked", "==", true)
        .where("whoInteracted", "==", user.uid)
        .get()
        .then((querySnapshot) => {
          const postIds: string[] = [];
          querySnapshot.forEach((doc) => {
            const interaction = doc.data() as InteractionType;
            postIds.push(interaction.withWhat);
          });
          firestore
            .collection("posts")
            .where(firebase.firestore.FieldPath.documentId(), "in", postIds)
            .get()
            .then((querySnapshot) => {
              const dirtyPosts: PostType[] = [];
              querySnapshot.forEach((doc) => {
                const post = doc.data() as PostType;
                post.id = doc.id;
                dirtyPosts.push(post);
              });
              setPosts(dirtyPosts);
            });
        });
    };
    goGet();
  }, [user]);
  return (
    <div>
      <h1>Bookmarks</h1>
      {posts.map((post) => (
        <Post
          authorAt={post.authorAt}
          authorId={post.authorId}
          authorName={post.authorName}
          id={post.id}
          createdAt={post.createdAt}
          score={post.score}
          text={post.text}
          comments={post.comments}
          photoURL={post.photoURL}
        />
      ))}
    </div>
  );
};

export default Bookmarks;

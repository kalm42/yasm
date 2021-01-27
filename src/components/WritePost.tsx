import { FormEvent, useEffect, useState } from "react";
import firebase from "firebase/app";
import { firestore } from "../services/firebase";
import { useUser } from "../context";
import { ExtendedUser } from "../models/posts";

const WritePost = () => {
  const [post, setPost] = useState("");
  const [author, setAuthor] = useState<ExtendedUser | null>(null);
  const { user } = useUser();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !author) return;
    const postsRef = firestore.collection("posts");

    try {
      await postsRef.add({
        text: post,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        authorId: user.uid,
        authorAt: author.id,
        authorName: user.displayName,
        photoURL: user.photoURL,
      });
      setPost("");
    } catch (error) {
      console.warn(`WritePost Error: ${error.message}`);
    }
  };

  // get current user details
  useEffect(() => {
    const getUser = async () => {
      if (!user) return;
      const u = await firestore.doc(`users/${user.uid}`).get();
      const p = u.data();
      if (p) {
        p.uid = u.id;
        setAuthor(p as ExtendedUser);
      }
    };
    getUser();
  }, [user]);

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="text"
        value={post}
        required
        onChange={(e) => setPost(e.target.value)}
      />
      <button type="submit">✍️</button>
    </form>
  );
};

export default WritePost;

import { FormEvent, useState } from "react";
import firebase from "firebase/app";
import { auth, firestore } from "../Firebase";

const WritePost = () => {
  const [post, setPost] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      // TODO: show some error regarding not being logged in.
      return;
    }
    const postsRef = firestore.collection("posts");
    const { uid, photoURL, displayName } = auth.currentUser;

    try {
      await postsRef.add({
        text: post,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        authorId: uid,
        authorName: displayName,
        photoURL,
      });
      setPost("");
    } catch (error) {
      console.warn(`WritePost Error: ${error.message}`);
    }
  };

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

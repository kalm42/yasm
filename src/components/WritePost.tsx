import { FormEvent, useEffect, useState } from "react";
import * as Sentry from "@sentry/react";
import firebase from "firebase/app";
import { firestore } from "../services/firebase";
import { useUser } from "../context";
import { UserType } from "../models";

const WritePost = () => {
  const [post, setPost] = useState("");
  const [author, setAuthor] = useState<UserType | null>(null);
  const { user } = useUser();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !author) return;
    const postsRef = firestore.collection("posts");

    try {
      await postsRef.add({
        text: post,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        authorId: user._id,
        authorAt: author.at,
        authorName: user.name,
        photoURL: user.profileImage,
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
      try {
        const u = await firestore.doc(`users/${user._id}`).get();
        const p = u.data();
        if (p) {
          p.uid = u.id;
          setAuthor(p as UserType);
        }
      } catch (error) {
        console.warn("WritePost:getUser", error.message);
      }
    };
    getUser();
  }, [user]);

  return (
    <Sentry.ErrorBoundary fallback={FallbackWritePost}>
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
    </Sentry.ErrorBoundary>
  );
};

function FallbackWritePost() {
  return (
    <div>
      <h1>Error: Write Post</h1>
      <p>
        An error has occured. Please refresh the page. If the error persists
        please contact support.
      </p>
    </div>
  );
}

export default WritePost;

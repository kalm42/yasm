import { useEffect, useState } from "react";
import * as Sentry from "@sentry/react";
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
    <Sentry.ErrorBoundary fallback={FallbackBookmarksPage}>
      <div>
        <h1>Bookmarks</h1>
        {posts.map((post) => (
          <Post key={post._id} {...post} />
        ))}
      </div>
    </Sentry.ErrorBoundary>
  );
};

function FallbackBookmarksPage() {
  return (
    <div>
      <h1>Error: Bookmarks Page</h1>
      <p>
        An error has occured. Please refresh the page. If the error continues
        please contact support.
      </p>
    </div>
  );
}

export default Bookmarks;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as Sentry from "@sentry/react";
import moment from "moment";
import Comments from "../components/Comments";
import { useUser } from "../context";
import { PostType, UserType } from "../models";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getPostByDocId, getUserWithId } from "../services";

const Post = () => {
  const params = useParams<{ id: string }>();
  const { user } = useUser();
  const [post, setPost] = useState<PostType | null>(null);
  const [author, setAuthor] = useState<UserType | null>(null);

  // Get the post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const p = await getPostByDocId(params.id);
        setPost(p);
      } catch (error) {
        console.warn("Post:fetchPost", error.message);
      }
    };
    fetchPost();
  }, [params]);

  // Get the
  useEffect(() => {
    const getAuthor = async () => {
      console.log("page Post:getAuthor");
      if (!post) return;
      try {
        setAuthor(await getUserWithId(post.authorId));
      } catch (error) {
        console.warn("Post:getAuthor", error.message);
      }
    };
    getAuthor();
  }, [post]);

  if (!post) return null;

  return (
    <Sentry.ErrorBoundary fallback={FallbackPost}>
      <div>
        <article>
          <Header
            author={author}
            time={moment(post.createdAt.toDate()).fromNow()}
            back
          />
          <p>{post.text}</p>
          <Footer disabled={!user} post={post} />
        </article>
        {!user && <p>To interact with a post please login.</p>}
        <section>
          <Comments post={post} />
        </section>
      </div>
    </Sentry.ErrorBoundary>
  );
};

function FallbackPost() {
  return (
    <div>
      <h1>Error: Post Page</h1>
      <p>
        An error has occured. Please refresh the page. If the error persists
        please contact support.
      </p>
    </div>
  );
}

export default Post;

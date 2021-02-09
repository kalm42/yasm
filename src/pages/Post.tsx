import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as Sentry from "@sentry/react";
import Bookmark from "../components/Bookmark";
import Comments from "../components/Comments";
import ProfileImage from "../components/ProfileImage";
import Report from "../components/Report";
import Score from "../components/Score";
import { useUser } from "../context";
import { InteractionType, PostType, UserType } from "../models";
import {
  getInteractionWith,
  getPostByDocId,
  getUserWithId,
} from "../services/firebase";

const Post = () => {
  const params = useParams<{ id: string }>();
  const { user } = useUser();
  const [post, setPost] = useState<PostType | null>(null);
  const [author, setAuthor] = useState<UserType | null>(null);
  const [interactions, setInteractions] = useState<InteractionType | null>(
    null
  );

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

  // fetch post author details
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

  // fetch interactions
  useEffect(() => {
    let unsubscribe: () => void | undefined;
    const getInteractions = async () => {
      console.log("page Post:getInteractions");
      if (!user || !post) return;
      try {
        unsubscribe = getInteractionWith(post, user, setInteractions);
      } catch (error) {
        // getInteractionWith throws an error if the document doesn't exist
        // this is here to swallow that error.
      }
    };
    getInteractions();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [post, user]);

  if (!post) return null;

  return (
    <Sentry.ErrorBoundary fallback={FallbackPost}>
      <div>
        <div>
          <ProfileImage url={author?.profileImage} userAt={author?.at} />
          <p>
            {author?.name} - @{author?.at}
          </p>
        </div>
        <article>{post.text}</article>
        <div>
          <fieldset disabled={!user}>
            <Score document={post} />
            <Bookmark post={post} interaction={interactions} />
            <Report document={post} />
            {!user && <p>To interact with a post please login.</p>}
          </fieldset>
        </div>
        <Comments post={post} />
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

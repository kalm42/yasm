import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
      const p = await getPostByDocId(params.id);
      setPost(p);
    };
    fetchPost();
  }, [params]);

  // fetch post author details
  useEffect(() => {
    const getAuthor = async () => {
      console.log("page Post:getAuthor");
      if (!post) return;
      setAuthor(await getUserWithId(post.authorId));
    };
    getAuthor();
  }, [post]);

  // fetch interactions
  useEffect(() => {
    const getInteractions = async () => {
      console.log("page Post:getInteractions");
      if (!user || !post) return;
      setInteractions(await getInteractionWith(post, user));
    };
    getInteractions();
  }, [post, user]);

  if (!post) return null;

  return (
    <div>
      <div>
        <ProfileImage url={user?.profileImage} userAt={user?.at} />
        <p>
          {author?.name} - @{author?.at}
        </p>
      </div>
      <article>{post.text}</article>
      <div>
        <Score document={post} />
        <Bookmark post={post} interaction={interactions} />
        <Report document={post} />
      </div>
      <Comments post={post} />
    </div>
  );
};

export default Post;

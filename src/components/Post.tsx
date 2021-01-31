import ProfileImage from "./ProfileImage";
import { InteractionType, PostType, UserType } from "../models";
import styled from "styled-components";
import { getInteractionWith, getUserWithId } from "../services/firebase";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Score from "./Score";
import WriteComment from "./WriteComment";
import Bookmark from "./Bookmark";
import { useUser } from "../context";
import Report from "./Report";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: calc(8vmin) 1fr;
`;
const PostWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
const Author = styled.div`
  display: flex;
`;
const ToolBar = styled.ul`
  list-style: none;
  padding: calc(1vmin);
  margin: 0;
  display: flex;
  border: 1px solid black;
  border-radius: 6px;
  justify-items: center;
  align-items: center;
`;
const Tool = styled.li`
  flex: 1;
  width: 100%;
  display: flex;
  justify-items: center;
  align-items: center;
`;

const Post = (props: PostType) => {
  const { authorId, text, _id } = props;
  const [interactions, setInteractions] = useState<InteractionType | null>(
    null
  );
  const [author, setAuthor] = useState<UserType | null>(null);
  const { user } = useUser();

  // get if the user has interacted with the post.
  useEffect(() => {
    const getInteractions = async () => {
      console.log("Post:getInteractions");
      if (!props || !user) return;
      setInteractions(await getInteractionWith(props, user));
    };
    getInteractions();
  }, [user, props]);

  // get author's data
  useEffect(() => {
    const getAuthor = async () => {
      console.log("Post:getAuthor");
      setAuthor(await getUserWithId(authorId));
    };
    getAuthor();
  }, [authorId]);

  return (
    <Wrapper>
      <ProfileImage url={author?.profileImage} userAt={author?.at} />
      <PostWrapper>
        <Author>
          <p>{author?.name}</p>
          <p>@{author?.at}</p>
        </Author>
        <div>{text}</div>
        <div>
          <Link to={`/post/${_id}`}>View post</Link>
        </div>
        <ToolBar>
          <Tool>
            <Score document={props} />
          </Tool>
          <Tool>
            <WriteComment post={props} />
          </Tool>
          <Tool>
            <Bookmark post={props} interaction={interactions} />
          </Tool>
          <Tool>
            <Report document={props} />
          </Tool>
        </ToolBar>
      </PostWrapper>
    </Wrapper>
  );
};

export default Post;

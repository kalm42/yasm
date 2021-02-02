import * as Sentry from "@sentry/react";
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
      try {
        setInteractions(await getInteractionWith(props, user));
      } catch (error) {
        // getInteractionWith throws an error if the document doesn't exist
        // this is here to swallow that error.
      }
    };
    getInteractions();
  }, [user, props]);

  // get author's data
  useEffect(() => {
    const getAuthor = async () => {
      console.log("Post:getAuthor");
      try {
        setAuthor(await getUserWithId(authorId));
      } catch (error) {
        console.warn("Post:getAuthor", error.message);
      }
    };
    getAuthor();
  }, [authorId]);

  return (
    <Sentry.ErrorBoundary fallback={FallbackPost}>
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
          <fieldset disabled={!user}>
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
            {!user && <p>To interact with posts please login.</p>}
          </fieldset>
        </PostWrapper>
      </Wrapper>
    </Sentry.ErrorBoundary>
  );
};

function FallbackPost() {
  return (
    <div>
      <h1>Error: Post</h1>
      <p>
        An error has occured. Please refresh the page. If the problem continues
        please contact support.
      </p>
    </div>
  );
}

export default Post;

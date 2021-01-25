import ProfileImage from "./ProfileImage";
import { Post as PostModel } from "../models/posts";
import styled from "styled-components";

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
  padding: 0;
  margin: 0;
  display: flex;
`;
const Tool = styled.li`
  flex: 1;
`;

const Post = (props: PostModel) => {
  const { authorName, authorId, text } = props;
  return (
    <Wrapper>
      <ProfileImage />
      <PostWrapper>
        <Author>
          <p>{authorName}</p>
          <p>@{authorId}</p>
        </Author>
        <div>{text}</div>
        <ToolBar>
          <Tool>vote</Tool>
          <Tool>comment</Tool>
          <Tool>bookmark</Tool>
          <Tool>report</Tool>
        </ToolBar>
      </PostWrapper>
    </Wrapper>
  );
};

export default Post;

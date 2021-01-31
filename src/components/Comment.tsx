import { useEffect, useState } from "react";
import { useUser } from "../context";
import { CommentType, PostType, UserType } from "../models";
import { getRepliesToComment, getUserWithId } from "../services/firebase";
import Report from "./Report";
import Score from "./Score";
import WriteComment from "./WriteComment";

interface Props {
  comment: CommentType;
  post: PostType;
}
const Comment = (props: Props) => {
  const { comment, post } = props;
  const [comments, setComments] = useState<CommentType[] | null>(null);
  const [author, setAuthor] = useState<UserType | null>(null);
  const { user } = useUser();

  const getReplies = async () => {
    try {
      setComments(
        await getRepliesToComment(post._id, comment._id, comment.level + 1)
      );
    } catch (error) {
      console.warn("Comment:getReplies", error.message);
    }
  };

  // fetch author details
  useEffect(() => {
    const getAuthor = async () => {
      try {
        setAuthor(await getUserWithId(comment.authorId));
      } catch (error) {
        console.warn("Comment:getAuthor", error.message);
      }
    };
    getAuthor();
  }, [comment]);

  return (
    <section style={{ border: "1px solid black", padding: "calc(1vmin)" }}>
      <div style={{ display: "flex", gap: "calc(1vmin)" }}>
        <p>
          {author?.name} at {comment.createdAt.toDate().toDateString()}
        </p>
        <div>
          <p>{comment.text}</p>
          <fieldset disabled={!user}>
            <ul
              style={{
                display: "flex",
                listStyle: "none",
                padding: 0,
                margin: 0,
                gap: "calc(1vmin)",
              }}
            >
              <li>
                <Score document={comment} />
              </li>
              <li>
                <Report document={comment} />
              </li>
              <li>
                <WriteComment post={post} parentComment={comment} />
              </li>
            </ul>
            {!user && <p>To interact with a comment please login.</p>}
          </fieldset>
        </div>
      </div>
      <section style={{ padding: "calc(1vmin)", border: "1px solid black" }}>
        <button onClick={getReplies}>View the latest 10 of n replies.</button>
        {comments?.map((reply) => (
          <Comment comment={reply} post={post} key={reply._id} />
        ))}
      </section>
    </section>
  );
};

export default Comment;

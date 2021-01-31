import { useState } from "react";
import { useUser } from "../context";
import { CommentType, PostType } from "../models";
import { writeComment } from "../services/firebase";

interface Props {
  post: PostType;
  parentComment?: CommentType;
}
const WriteComment = (props: Props) => {
  const { post, parentComment } = props;
  const { user } = useUser();
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value);
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    if (parentComment) {
      writeComment(user, post, comment, parentComment);
    } else {
      writeComment(user, post, comment, undefined);
    }
    setIsCommenting(false);
    setComment("");
  };
  return isCommenting ? (
    <form onSubmit={handleSubmit}>
      <label htmlFor="comment">Comment*:</label>
      <input
        type="text"
        name="comment"
        required
        value={comment}
        onChange={handleChange}
      />
      <button type="submit">✍️</button>
    </form>
  ) : (
    <>
      <button onClick={() => setIsCommenting(true)}>comment</button>
      <p>({parentComment ? parentComment.commentCount : post.commentCount})</p>
    </>
  );
};

export default WriteComment;

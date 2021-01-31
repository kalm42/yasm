import { useEffect, useState } from "react";
import { useUser } from "../context";
import { CommentType, PostType } from "../models";
import { getCommentsForPost, writeComment } from "../services/firebase";
import Comment from "./Comment";

interface Props {
  post: PostType;
}

const Comments = (props: Props) => {
  const { post } = props;
  const { user } = useUser();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [comment, setComment] = useState("");

  const handleUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!post || !user || !comment.length) return;
    writeComment(user, post, comment);
    setComment("");
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const intermediaVariable = await getCommentsForPost(post._id);
        setComments(intermediaVariable);
      } catch (error) {
        console.warn("Comments:fetchComments", error.message);
      }
    };
    fetchComments();
  }, [post]);

  return (
    <section>
      <h3>Comments - {post.commentCount}</h3>
      <form onSubmit={handleSubmit}>
        <fieldset disabled={!user}>
          <label htmlFor="comment">Your comment:</label>
          <input
            type="text"
            name="comment"
            required
            value={comment}
            onChange={handleUpdate}
          />
          <button type="submit">Submit</button>
          {!user && <p>To comment please login.</p>}
        </fieldset>
      </form>
      {comments.map((comment, index) => (
        <Comment comment={comment} post={post} key={index} />
      ))}
    </section>
  );
};

export default Comments;

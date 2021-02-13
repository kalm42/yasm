import { useEffect, useState } from "react";
import * as Sentry from "@sentry/react";
import { CommentType, PostType } from "../models";
import Comment from "./Comment";
import { subscribeToComments } from "../services";

interface Props {
  post: PostType;
}

const Comments = (props: Props) => {
  const { post } = props;
  const [comments, setComments] = useState<CommentType[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        subscribeToComments(post._id, 0, setComments);
      } catch (error) {
        console.warn("Comments:fetchComments", error.message);
      }
    };
    fetchComments();
  }, [post]);

  return (
    <Sentry.ErrorBoundary fallback={FallbackComment}>
      <section>
        {comments.map((comment, index) => (
          <Comment comment={comment} post={post} key={index} />
        ))}
      </section>
    </Sentry.ErrorBoundary>
  );
};

function FallbackComment() {
  return (
    <div>
      <h1>Error: Comments</h1>
      <p>
        An error has occured. Please refresh the page. If the error continues
        please contact support.
      </p>
    </div>
  );
}

export default Comments;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProfileImage from "../components/ProfileImage";
import Score from "../components/Score";
import { useUser } from "../context";
import { CommentType, PostType } from "../models";
import {
  firestore,
  getServerTimestamp,
  writeComment,
} from "../services/firebase";

const Post = () => {
  const params = useParams<{ id: string }>();
  const { user } = useUser();
  const [post, setPost] = useState<PostType | null>(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<CommentType[]>([]);

  const handleCommentUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value);
  };
  const handleCommentSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!post || !user) return;
    const collectionRef = firestore.collection(`posts`);
    const dirtyComment: CommentType = {
      authorId: user.uid,
      createdAt: getServerTimestamp(),
      replyCount: 0,
      score: 0,
      text: comment,
    };
    setComments([dirtyComment, ...comments]);
    writeComment(collectionRef, dirtyComment, post.id);
    setComment("");
  };

  useEffect(() => {
    firestore
      .doc(`posts/${params.id}`)
      .get()
      .then((doc) => {
        if (!doc.exists) return;
        const dirtyPost: PostType = doc.data() as PostType;
        dirtyPost.id = doc.id;
        setPost(dirtyPost);
      });
  }, [params]);

  useEffect(() => {
    firestore
      .collection(`posts/${params.id}/comments`)
      .get()
      .then((querySnapshot) => {
        const dirtyComments: CommentType[] = [];
        querySnapshot.forEach((doc) => {
          dirtyComments.push(doc.data() as CommentType);
        });
        setComments(dirtyComments);
      });
  }, []);

  if (!post) return null;

  return (
    <div>
      <h1>This is a post</h1>
      <div>
        <ProfileImage url={post.photoURL} userId={post.authorAt} />
        <p>
          {post.authorName} - @{post.authorAt}
        </p>
      </div>
      <article>{post.text}</article>
      <div>
        <Score
          hasInteracted={false}
          score={post.score}
          thumbsDown={() => {}}
          thumbsUp={() => {}}
        />
        <p>bookmark</p>
        <p>report</p>
      </div>
      <section>
        <h3>Comments</h3>
        <form onSubmit={handleCommentSubmit}>
          <label htmlFor="comment">Your comment:</label>
          <input
            type="text"
            name="comment"
            required
            value={comment}
            onChange={handleCommentUpdate}
          />
          <button type="submit">Submit</button>
        </form>
        {comments.map((comment, index) => (
          <section key={index}>
            <p>{comment.text}</p>
          </section>
        ))}
      </section>
      <pre>{JSON.stringify(post)}</pre>
    </div>
  );
};

export default Post;

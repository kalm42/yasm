import ProfileImage from "./ProfileImage";
import firebase from "firebase/app";
import { PostType } from "../models";
import styled from "styled-components";
import { firestore, getServerTimestamp } from "../services/firebase";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
  const {
    authorName,
    authorAt,
    authorId,
    text,
    photoURL,
    score,
    id,
    comments,
  } = props;
  const [interactions, setInteractions] = useState<
    firebase.firestore.DocumentData | undefined
  >(undefined);
  const [comment, setComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [report, setReport] = useState("");
  const interactionsPath = `interactions/${authorId}_${id}`;

  const thumbsUp = () => {
    firestore
      .doc(`posts/${id}`)
      .set({ score: score ? score + 1 : 1 }, { merge: true });
    firestore
      .doc(interactionsPath)
      .set(
        { vote: true, whoInteracted: authorId, withWhat: id },
        { merge: true }
      );
    setInteractions({ ...interactions, vote: true });
  };
  const thumbsDown = () => {
    firestore
      .doc(`posts/${id}`)
      .set({ score: score ? score - 1 : -1 }, { merge: true });
    firestore
      .doc(interactionsPath)
      .set(
        { vote: true, whoInteracted: authorId, withWhat: id },
        { merge: true }
      );
    setInteractions({ ...interactions, vote: false });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComment(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    firestore
      .doc(`posts/${id}`)
      .set({ comments: comments ? comments + 1 : 1 }, { merge: true });
    firestore.collection("posts").doc(id).collection("comments").add({
      createdAt: getServerTimestamp(),
      test: comment,
    });
    setIsCommenting(false);
  };

  const handleBookmark = () => {
    firestore
      .doc(interactionsPath)
      .set(
        { bookmarked: true, whoInteracted: authorId, withWhat: id },
        { merge: true }
      );
    setInteractions({ ...interactions, bookmarked: true });
  };

  const handleReportUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReport(event.target.value);
  };

  const handleReportSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    firestore.doc(`reports/${authorId}_${id}`).set({
      text: report,
      reportedBy: authorId,
      reported: id,
    });
    firestore
      .doc(interactionsPath)
      .set(
        { report: `${authorId}_${id}`, whoInteracted: authorId, withWhat: id },
        { merge: true }
      );
    setIsReporting(false);
  };

  useEffect(() => {
    // get if the user has interacted with the post.
    firestore
      .doc(interactionsPath)
      .get()
      .then((doc) => {
        if (doc) setInteractions(doc.data());
      });
  }, [interactionsPath]);

  return (
    <Wrapper>
      <ProfileImage url={photoURL} userId={authorName} />
      <PostWrapper>
        <Author>
          <p>{authorName}</p>
          <p>@{authorAt}</p>
        </Author>
        <div>{text}</div>
        <div>
          <Link to={`/post/${id}`}>View post</Link>
        </div>
        <ToolBar>
          <Tool>
            <button onClick={thumbsUp} disabled={interactions !== undefined}>
              👍
            </button>
            <p>{score || 0}</p>
            <button onClick={thumbsDown} disabled={interactions !== undefined}>
              👎
            </button>
          </Tool>
          <Tool>
            {isCommenting ? (
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
              <button onClick={() => setIsCommenting(true)}>
                comment ({comments || 0})
              </button>
            )}
          </Tool>
          <Tool>
            {interactions?.bookmarked ? (
              <p>bookmarked</p>
            ) : (
              <button onClick={handleBookmark}>bookmark</button>
            )}
          </Tool>
          <Tool>
            {isReporting ? (
              <form onSubmit={handleReportSubmit}>
                <label htmlFor="report">Why is this rude?*</label>
                <input
                  type="text"
                  name="report"
                  required
                  value={report}
                  onChange={handleReportUpdate}
                />
                <button type="submit">File Report</button>
              </form>
            ) : (
              <button onClick={() => setIsReporting(true)}>report</button>
            )}
          </Tool>
        </ToolBar>
      </PostWrapper>
    </Wrapper>
  );
};

export default Post;

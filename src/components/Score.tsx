import { useEffect, useState } from "react";
import * as Sentry from "@sentry/react";
import { useUser } from "../context";
import { CommentType, PostType } from "../models";
import {
  decrementScore,
  getInteractionWith,
  incrementScore,
} from "../services/firebase";
import styles from "./Score.module.css";

interface Props {
  document: CommentType | PostType;
}

const Score = (props: Props) => {
  const { document } = props;
  const [didUpVote, setDidUpVote] = useState(false);
  const [didDownVote, setDidDownVote] = useState(false);
  const { user } = useUser();

  const thumbsUp = () => {
    if (!user) return;
    incrementScore(document, user);
    setDidUpVote(true);
  };
  const thumbsDown = () => {
    if (!user) return;
    decrementScore(document, user);
    setDidDownVote(true);
  };

  useEffect(() => {
    const checkForInteraction = async () => {
      console.log("Score:checkForInteraction");
      if (!user) return;
      getInteractionWith(document, user)
        .then((inter) => {
          if (inter?.vote !== undefined) {
            if (inter.vote) {
              setDidUpVote(true);
            } else {
              setDidDownVote(true);
            }
          }
        })
        .catch(() => {
          // throws an error if the document doesn't exist. This is here to
          // swallow the error.
        });
    };
    checkForInteraction();
  }, [user, document]);

  return (
    <Sentry.ErrorBoundary fallback={FallbackScore}>
      <div className={styles.root}>
        <button
          onClick={thumbsUp}
          className={`${styles.vote} ${didUpVote && styles.active}`}
        >
          👍
        </button>
        <p className={styles.score}>{document.score || 0}</p>
        <button
          onClick={thumbsDown}
          className={`${styles.vote} ${didDownVote && styles.active}`}
        >
          👎
        </button>
      </div>
    </Sentry.ErrorBoundary>
  );
};

function FallbackScore() {
  return (
    <div>
      <h1>Error: Score</h1>
      <p>
        An error has occured. Please refresh the page. If the error continues
        please contact support.
      </p>
    </div>
  );
}

export default Score;

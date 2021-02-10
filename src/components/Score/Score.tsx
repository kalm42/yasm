import { useEffect, useState } from "react";
import * as Sentry from "@sentry/react";
import { useUser } from "../../context";
import { CommentType, InteractionType, PostType } from "../../models";
import {
  decrementScore,
  undecrementScore,
  getInteractionWith,
  incrementScore,
  unincrementScore,
  switchDownVoteToUpVote,
  switchUpVoteToDownVote,
} from "../../services/firebase";
import styles from "./Score.module.css";

interface Props {
  document: CommentType | PostType;
}

const Score = (props: Props) => {
  const { document } = props;
  const [interaction, setInteraction] = useState<InteractionType | null>(null);
  const { user } = useUser();
  const didUpVote = interaction?.vote !== undefined && interaction.vote;
  const didDownVote = interaction?.vote !== undefined && !interaction.vote;

  const thumbsUp = () => {
    if (!user) return;
    switch (interaction?.vote) {
      case true:
        // did up vote
        unincrementScore(document, user);
        break;
      case false:
        // did down vote
        switchDownVoteToUpVote(document, user);
        break;

      default:
        // has not voted
        incrementScore(document, user);
        break;
    }
  };
  const thumbsDown = () => {
    if (!user) return;
    switch (interaction?.vote) {
      case true:
        // already up voted
        switchUpVoteToDownVote(document, user);
        break;
      case false:
        // already down voted
        undecrementScore(document, user);
        break;

      default:
        // has not voted
        decrementScore(document, user);
        break;
    }
  };

  useEffect(() => {
    let unsubscribe: () => void | undefined;
    const checkForInteraction = async () => {
      console.log("Score:checkForInteraction");
      if (!user) return;
      unsubscribe = getInteractionWith(document, user, setInteraction);
    };
    checkForInteraction();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
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

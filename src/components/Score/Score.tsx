import { useEffect, useState } from "react";
import * as Sentry from "@sentry/react";
import { useUser } from "../../context";
import { CommentType, InteractionType, PostType } from "../../models";
import { subscribeToInteractionWith } from "../../services/firebase";
import styles from "./Score.module.css";
import {
  decrementScore,
  incrementScore,
  switchDownVoteToUpVote,
  switchUpVoteToDownVote,
  undecrementScore,
  unincrementScore,
} from "../../services";
import { useAlert } from "../../context/AlertContext";

interface Props {
  document: CommentType | PostType;
}

const Score = (props: Props) => {
  const { document } = props;
  const [interaction, setInteraction] = useState<InteractionType | null>(null);
  const { user } = useUser();
  const { addAlert } = useAlert();
  const didUpVote = interaction?.vote !== undefined && interaction.vote;
  const didDownVote = interaction?.vote !== undefined && !interaction.vote;

  const thumbsUp = () => {
    if (!user) return;
    switch (interaction?.vote) {
      case true:
        // did up vote
        unincrementScore(document, user)
          .then(() => {
            addAlert({
              id: Symbol(`upvoted-${document._id}`),
              message: `Successfully removed your vote.`,
            });
          })
          .catch((error) => {
            addAlert({
              id: Symbol(`upvote-failed`),
              message: `Failed to remove your vote. Error: ${error.message}`,
            });
          });
        break;
      case false:
        // did down vote
        switchDownVoteToUpVote(document, user)
          .then(() => {
            addAlert({
              id: Symbol(`upvoted-${document._id}`),
              message: `Successfully switched your down vote to an up vote.`,
            });
          })
          .catch((error) => {
            addAlert({
              id: Symbol(`upvote-failed`),
              message: `Failed to switch your vote from down to up. Error: ${error.message}`,
            });
          });
        break;

      default:
        // has not voted
        incrementScore(document, user)
          .then(() => {
            addAlert({
              id: Symbol(`upvoted-${document._id}`),
              message: `Successfully up voted!`,
            });
          })
          .catch((error) => {
            addAlert({
              id: Symbol(`upvote-failed`),
              message: `Failed to up vote. Error: ${error.message}`,
            });
          });
        break;
    }
  };
  const thumbsDown = () => {
    if (!user) return;
    switch (interaction?.vote) {
      case true:
        // already up voted
        switchUpVoteToDownVote(document, user)
          .then(() => {
            addAlert({
              id: Symbol(`upvoted-${document._id}`),
              message: `Successfully changed up vote to down vote!`,
            });
          })
          .catch((error) => {
            addAlert({
              id: Symbol(`upvote-failed`),
              message: `Failed to change the vote. Error: ${error.message}`,
            });
          });
        break;
      case false:
        // already down voted
        undecrementScore(document, user)
          .then(() => {
            addAlert({
              id: Symbol(`upvoted-${document._id}`),
              message: `Successfully removed your vote!`,
            });
          })
          .catch((error) => {
            addAlert({
              id: Symbol(`upvote-failed`),
              message: `Failed to remove your vote. Error: ${error.message}`,
            });
          });
        break;

      default:
        // has not voted
        decrementScore(document, user)
          .then(() => {
            addAlert({
              id: Symbol(`upvoted-${document._id}`),
              message: `Successfully down voted!`,
            });
          })
          .catch((error) => {
            addAlert({
              id: Symbol(`upvote-failed`),
              message: `Failed to down vote. Error: ${error.message}`,
            });
          });
        break;
    }
  };

  useEffect(() => {
    let unsubscribe: () => void | undefined;
    const checkForInteraction = async () => {
      console.log("Score:checkForInteraction");
      if (!user) return;
      unsubscribe = subscribeToInteractionWith(document, user, setInteraction);
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

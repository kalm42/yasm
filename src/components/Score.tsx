import { useEffect, useState } from "react";
import { useUser } from "../context";
import { CommentType, PostType } from "../models";
import {
  decrementScore,
  getInteractionWith,
  incrementScore,
} from "../services/firebase";

interface Props {
  document: CommentType | PostType;
}

const Score = (props: Props) => {
  const { document } = props;
  const [hasVoted, setHasVoted] = useState(false);
  const { user } = useUser();

  const thumbsUp = () => {
    if (!user) return;
    incrementScore(document, user);
    setHasVoted(true);
  };
  const thumbsDown = () => {
    if (!user) return;
    decrementScore(document, user);
    setHasVoted(true);
  };

  useEffect(() => {
    const checkForInteraction = async () => {
      console.log("Score:checkForInteraction");
      if (!user) return;
      getInteractionWith(document, user)
        .then((interaction) => {
          if (interaction?.vote !== undefined) {
            setHasVoted(true);
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
    <div style={{ display: "flex", gap: "calc(1vmin)" }}>
      <button onClick={thumbsUp} disabled={hasVoted}>
        👍
      </button>
      <p>{document.score || 0}</p>
      <button onClick={thumbsDown} disabled={hasVoted}>
        👎
      </button>
    </div>
  );
};

export default Score;

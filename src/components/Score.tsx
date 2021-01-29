interface Props {
  thumbsUp: () => void;
  thumbsDown: () => void;
  hasInteracted: boolean;
  score: number;
}

const Score = (props: Props) => {
  const { thumbsUp, thumbsDown, hasInteracted = false, score = 0 } = props;
  return (
    <div>
      <button onClick={thumbsUp} disabled={hasInteracted}>
        👍
      </button>
      <p>{score}</p>
      <button onClick={thumbsDown} disabled={hasInteracted}>
        👎
      </button>
    </div>
  );
};

export default Score;

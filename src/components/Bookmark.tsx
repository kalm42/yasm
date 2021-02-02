import { useUser } from "../context";
import * as Sentry from "@sentry/react";
import { InteractionType, PostType } from "../models";
import { bookmarkPost } from "../services/firebase";

interface Props {
  post: PostType;
  interaction: InteractionType | null;
}
const Bookmark = (props: Props) => {
  const { post, interaction } = props;
  const { user } = useUser();

  const handleBookmark = () => {
    if (!user) return;
    bookmarkPost(post, user);
  };

  return (
    <Sentry.ErrorBoundary fallback={FallbackBookmark}>
      {interaction?.bookmarked ? (
        <p>bookmarked</p>
      ) : (
        <button onClick={handleBookmark}>bookmark</button>
      )}
    </Sentry.ErrorBoundary>
  );
};

function FallbackBookmark() {
  <div>
    <h1>Error: Bookmark</h1>
    <p>
      An error has occured. Please refresh the page. If the error continues
      please contact support.
    </p>
  </div>;
}

export default Bookmark;

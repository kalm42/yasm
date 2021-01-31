import { useUser } from "../context";
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

  return interaction?.bookmarked ? (
    <p>bookmarked</p>
  ) : (
    <button onClick={handleBookmark}>bookmark</button>
  );
};

export default Bookmark;

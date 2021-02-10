import Score from "./Score";
import styles from "./Footer.module.css";
import { CommentType, PostType } from "../models";
import WriteComment from "./WriteComment";

interface Props {
  disabled: boolean;
  post: PostType;
  comment?: CommentType;
}

const Footer = (props: Props) => {
  const { disabled, post, comment } = props;
  return (
    <footer>
      <fieldset disabled={disabled} className={styles.fieldset}>
        <ul className={styles.toolbar}>
          <li className={styles.tool}>
            <Score document={comment ? comment : post} />
          </li>
          <li className={styles.tool}>
            <WriteComment post={post} parentComment={comment} />
          </li>
        </ul>
        {disabled && <p>To interact with posts please login.</p>}
      </fieldset>
    </footer>
  );
};

export default Footer;

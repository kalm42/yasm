import { faArrowLeft, faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useHistory } from "react-router-dom";
import { UserType } from "../../models";
import styles from "./Header.module.css";
import ProfileImage from "../ProfileImage";

interface Props {
  author: UserType | null;
  back?: boolean;
  time?: string;
}

const Header = (props: Props) => {
  const { author, back, time } = props;
  const history = useHistory();
  return (
    <header
      className={`${styles.header} ${
        back ? styles.fullHeader : styles.partialHeader
      }`}
    >
      {back && (
        <button className={styles.button} onClick={() => history.goBack()}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      )}
      <Link to={`/${author?._id}`} className={styles.link}>
        <ProfileImage url={author?.profileImage} userAt={author?.at} />
      </Link>
      <Link to={`/${author?._id}`} className={styles.link}>
        <section>
          <p className={styles.author}>
            {author?.name} @{author?.at}
          </p>
          <p className={styles.time}>{time}</p>
        </section>
      </Link>
      <button className={styles.options}>
        <FontAwesomeIcon icon={faEllipsisH} className={styles.icon} />
        {/* 
          // TODO: shove these in the options
          <li className={styles.tool}>
            <Bookmark post={props} interaction={interactions} />
          </li>
          <li className={styles.tool}>
            <Report document={props} />
          </li> 
        */}
      </button>
    </header>
  );
};

export default Header;

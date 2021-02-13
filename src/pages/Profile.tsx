import React, { useEffect, useRef, useState } from "react";
import * as Sentry from "@sentry/react";
import {
  atIsUnique,
  subscribeToUserWithTheirAt,
  updateUser,
} from "../services/firebase";
import { PostType, UserType } from "../models";
import { useHistory, useParams } from "react-router-dom";
import { useUser } from "../context";
import styles from "./Profile.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCheckCircle,
  faEdit,
  faPlusCircle,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import Post from "../components/Post";
import Form from "../components/Form";
import {
  doesFollow,
  followUser,
  subscribeToMyFeed,
  unfollowUser,
} from "../services";

const Profile = () => {
  const params = useParams<{ id: string }>();
  const { user } = useUser();
  const [profile, setProfile] = useState<UserType | null>(null);
  const [isMe, setIsMe] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [followsUser, setFollowsUser] = useState(false);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [name, setName] = useState("");
  const [at, setAt] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const history = useHistory();

  const toggleFollow = () => {
    if (!user || !profile) return;
    if (followsUser) {
      unfollowUser(user, profile).then(() => setFollowsUser(false));
    } else {
      followUser(user, profile).then(() => setFollowsUser(true));
    }
  };

  const didChange = () => {
    const nameDidChange = name !== profile?.name;
    const atDidChange = at !== profile?.at;
    return nameDidChange || atDidChange;
  };

  const toggleEdit = (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) {
      event.preventDefault();
    }
    if (!user || !profile) {
      return;
    }
    if (isEditing) {
      if (didChange()) {
        // save the changes
        updateUser(user._id, name, at)
          .then(() => {
            setIsEditing(false);
            history.push(`/${at}`);
          })
          .catch((error) => {
            ref.current?.setCustomValidity(error.message);
          });
      } else {
        setIsEditing(false);
      }
    } else {
      setName(profile.name);
      setAt(profile.at);
      setIsEditing(true);
    }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };
  const handleAtChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent quick changes from submitting before validation
    ref.current?.setCustomValidity("Still checking that your at is unique.");
    const _at = event.target.value;
    atIsUnique(_at).then((isUnique) => {
      if (!isUnique) {
        ref.current?.setCustomValidity("Your at is not unique.");
      } else {
        ref.current?.setCustomValidity("");
      }
    });
    setAt(_at);
  };

  // is the user me, or do I need to get the user data from external
  useEffect(() => {
    const getProfile = async () => {
      console.log("Profile:getProfile");
      if (user?.at === params.id) {
        setIsMe(true);
        setProfile(user);
      } else {
        setIsMe(false);
        try {
          subscribeToUserWithTheirAt(setProfile, params.id);
        } catch (error) {
          console.warn("Profile:getProfile", error.message);
        }
      }
    };
    getProfile();
  }, [user, params]);

  // do I follow the user?
  useEffect(() => {
    const doIFollow = async () => {
      console.log("Profile:doIFollow");
      if (isMe || !user || !profile) return;
      try {
        setFollowsUser(await doesFollow(user._id, profile._id));
      } catch (error) {
        console.warn("Profile:doIFollow", error.message);
      }
    };
    doIFollow();
  }, [isMe, user, profile]);

  // subscribe to posts from user
  useEffect(() => {
    let unsubscribe: () => void | undefined;
    const sub = () => {
      if (!profile) return;
      unsubscribe = subscribeToMyFeed([profile._id], setPosts);
    };
    sub();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [profile]);

  return (
    <Sentry.ErrorBoundary fallback={FallbackProfile}>
      <section>
        <header className={styles.header}>
          <button
            className={styles["control-button"]}
            onClick={() => history.goBack()}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          {isMe && (
            <button
              className={styles["control-button"]}
              onClick={() => toggleEdit()}
            >
              {isEditing ? (
                <FontAwesomeIcon icon={faSave} />
              ) : (
                <FontAwesomeIcon icon={faEdit} />
              )}
            </button>
          )}
        </header>
        <section>
          <section className={styles.profile}>
            <img
              src={profile?.profileImage}
              alt={profile?.at}
              className={styles.image}
            />
            {!isMe && (
              <button className={styles.follow} onClick={toggleFollow}>
                {followsUser ? (
                  <FontAwesomeIcon icon={faCheckCircle} size="2x" />
                ) : (
                  <FontAwesomeIcon icon={faPlusCircle} size="2x" />
                )}
              </button>
            )}
            {isEditing ? (
              <Form
                handleChange={handleNameChange}
                handleSubmit={toggleEdit}
                name="name"
                placeholder="What's your name?"
                value={name}
              />
            ) : (
              <p className={styles.name}>{profile?.name}</p>
            )}
            {isEditing ? (
              <Form
                handleChange={handleAtChange}
                handleSubmit={toggleEdit}
                name="at"
                placeholder="What's your at?"
                value={at}
                inputRef={ref}
              />
            ) : (
              <p className={styles.at}>@{profile?.at}</p>
            )}
          </section>
          <section className={styles.stats}>
            <p className={styles.stat} style={{ alignItems: "flex-end" }}>
              <span className={styles["stat-wrapper"]}>
                <span className={styles.detail}>{profile?.postCount ?? 0}</span>
                <span className={styles.title}>Posts</span>
              </span>
            </p>
            <p className={styles.stat}>
              <span className={styles.detail}>
                {profile?.followingCount ?? 0}
              </span>
              <span className={styles.title}>Following</span>
            </p>
            <p className={styles.stat} style={{ alignItems: "flex-start" }}>
              <span className={styles["stat-wrapper"]}>
                <span className={styles.detail}>
                  {profile?.followerCount ?? 0}
                </span>
                <span className={styles.title}>Followers</span>
              </span>
            </p>
          </section>
        </section>
        <section className={styles.posts}>
          {posts.map((post) => (
            <Post key={post._id} {...post} />
          ))}
        </section>
      </section>
    </Sentry.ErrorBoundary>
  );
};

function FallbackProfile() {
  return (
    <div>
      <h1>Error: Profile Page</h1>
      <p>
        An error has occured. Please refresh the page. If this continues please
        contact support.
      </p>
    </div>
  );
}

export default Profile;

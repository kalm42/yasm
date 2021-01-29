import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  doesFollow,
  followUser,
  getUserWithId,
  unfollowUser,
} from "../services/firebase";
import { UserType } from "../models";
import Biography from "../components/Biography";
import UserId from "../components/UserId";
import Links from "../components/Links";
import { useParams } from "react-router-dom";
import { useUser } from "../context";

const Half = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;
const OneFourth = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;
`;

const Profile = () => {
  const params = useParams<{ id: string }>();
  const { user } = useUser();
  const [profile, setProfile] = useState<UserType | null>(null);
  const [isMe, setIsMe] = useState(false);
  const [followsUser, setFollowsUser] = useState(false);

  const follow = () => {
    if (!user || !profile) return;
    followUser(user, profile)
      .then(() => setFollowsUser(true))
      .catch(() => console.warn("Follow failed"));
  };
  const unfollow = () => {
    if (!user || !profile) return;
    unfollowUser(user, profile)
      .then(() => setFollowsUser(false))
      .catch(() => console.warn("Unfollow failed"));
  };

  // Fetch the user from firestore based on url id
  useEffect(() => {
    const getUser = async () => {
      const p = await getUserWithId(params.id);
      setProfile(p);
      if (!p) return;
      // if the document's id matches the currently logged in user then they're
      // the currently logged in user and more UI can be displayed
      if (p.uid === user?.uid) {
        setIsMe(true);
      }
    };
    getUser();
  }, [user, params.id]);

  useEffect(() => {
    const doIFollow = async () => {
      if (!user || !profile) return;
      setFollowsUser(await doesFollow(user, profile));
    };
    doIFollow();
  }, [user, profile]);

  return (
    <div>
      <Half>
        <div>
          <h2>Profile Image</h2>
          {!!profile?.profileImage && (
            <img src={profile?.profileImage} alt={profile.name} />
          )}
          {isMe && <button>edit</button>}
        </div>
        <UserId uid={profile?.id || ""} isMe={isMe} />
        {user &&
          profile &&
          (followsUser ? (
            <button onClick={unfollow}>unfollow</button>
          ) : (
            <button onClick={follow}>follow</button>
          ))}
      </Half>
      <OneFourth>
        <Links links={profile?.links || []} isMe={isMe} />
        <Biography bio={profile?.bio || ""} isMe={isMe} />
      </OneFourth>
      <p>
        This page will show all of a user's posts, their profile image, bio
        snipet, and link list.
      </p>
    </div>
  );
};

export default Profile;

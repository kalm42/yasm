import React, { useEffect, useState } from "react";
import styled from "styled-components";
import * as Sentry from "@sentry/react";
import {
  doesFollow,
  followUser,
  getUserWithTheirAt,
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
    followUser(user, profile).then(() => setFollowsUser(true));
  };
  const unfollow = () => {
    if (!user || !profile) return;
    unfollowUser(user, profile).then(() => setFollowsUser(false));
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
          setProfile(await getUserWithTheirAt(params.id));
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

  return (
    <Sentry.ErrorBoundary fallback={FallbackProfile}>
      <div>
        <Half>
          <div>
            <h2>Profile Image</h2>
            {!!profile?.profileImage && (
              <img src={profile?.profileImage} alt={profile.name} />
            )}
            {isMe && <button>edit</button>}
          </div>
          <UserId at={profile?.at || ""} isMe={isMe} />
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

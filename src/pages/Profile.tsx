import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { getUserWithId } from "../services/firebase";
import { User } from "../models/posts";
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
  const [profile, setProfile] = useState<User | null>(null);
  const [isMe, setIsMe] = useState(false);

  // Fetch the user from firestore based on url id
  useEffect(() => {
    (async function () {
      const profile = await getUserWithId(params.id);
      setProfile(profile);
      if (!profile) return;
      // if the document's id matches the currently logged in user then they're
      // the currently logged in user and more UI can be displayed
      if (profile.uid === user?.uid) {
        setIsMe(true);
      }
    })();
  }, [user, params.id]);

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
        <button>follow</button>
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

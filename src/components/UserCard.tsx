import styled from "styled-components";
import ProfileImage from "./ProfileImage";
import { useUser, useAuth } from "../context";
import { getUserWithUID } from "../services/firebase";
import { useEffect, useState } from "react";
import { ExtendedUser } from "../models/posts";

const Card = styled.div`
  display: flex;
`;
const UserDeets = styled.div`
  flex: 1;
`;

const UserCard = () => {
  const { login, logout } = useAuth();
  const { user } = useUser();
  const [fireUser, setFireUser] = useState<ExtendedUser | null>(null);

  useEffect(() => {
    const getUser = async () => {
      if (!user) return;
      setFireUser(await getUserWithUID(user.uid));
    };
    getUser();
  }, [user]);

  return user ? (
    <Card>
      <ProfileImage url={fireUser?.profileImage} userId={fireUser?.id} />
      <UserDeets>
        <p>{fireUser?.name}</p>
        <p>@{fireUser?.id}</p>
      </UserDeets>
      <button onClick={() => logout()}>Sign Out</button>
    </Card>
  ) : (
    <Card>
      <button onClick={() => login()}>Sign in with Google</button>
    </Card>
  );
};

export default UserCard;

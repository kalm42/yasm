import React from "react";
import styled from "styled-components";
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
  const { user } = useUser();
  return (
    <div>
      <h1>Profile Page</h1>
      <Half>
        <div>
          <h2>Profile Image</h2>
          {!!user?.profileImage && (
            <img src={user?.profileImage} alt={user.name} />
          )}
          <button>edit</button>
        </div>
        <div>
          <h2>User Name</h2>
          <p>{user?.id}</p>
          <button>edit</button>
        </div>
      </Half>
      <OneFourth>
        <div>
          <h2>Links</h2>
          <ul>
            {user?.links.map((link, index) => (
              <li key={index}>{link}</li>
            ))}
          </ul>
          <button>edit</button>
        </div>
        <div>
          <h2>Biography</h2>
          <p>{user?.bio}</p>
          <button>edit</button>
        </div>
      </OneFourth>
      <p>
        This page will show all of a user's posts, their profile image, bio
        snipet, and link list.
      </p>
    </div>
  );
};

export default Profile;

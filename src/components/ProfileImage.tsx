import styled from "styled-components";
import * as Sentry from "@sentry/react";
import portrait from "../assets/portrait.jpg";

const Image = styled.img`
  width: calc(8vmin);
  clip-path: circle(calc(4vmin) at center);
`;

interface Props {
  url?: string;
  userAt?: string;
}

const ProfileImage = (props: Props) => {
  const { url, userAt } = props;
  let img = url;

  if (!url) img = portrait;

  return (
    <Sentry.ErrorBoundary fallback={FallbackProfileImage}>
      <Image src={img} alt={userAt ? `@${userAt}` : `error`} />
    </Sentry.ErrorBoundary>
  );
};

function FallbackProfileImage() {
  return (
    <div>
      <h1>Error: Profile Image</h1>
      <p>
        An error has occured. Please refresh the page. If the problem persists
        please contact support.
      </p>
    </div>
  );
}

export default ProfileImage;

import styled from "styled-components";
import portrait from "../assets/portrait.jpg";

const Image = styled.img`
  width: calc(8vmin);
  clip-path: circle(calc(4vmin) at center);
`;

const ProfileImage = () => {
  return <Image src={portrait} alt="User id" />;
};

export default ProfileImage;

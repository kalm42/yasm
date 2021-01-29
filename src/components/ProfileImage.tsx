import styled from "styled-components";
import { Url } from "url";
import portrait from "../assets/portrait.jpg";

const Image = styled.img`
  width: calc(8vmin);
  clip-path: circle(calc(4vmin) at center);
`;

interface Props {
  url?: string;
  userId?: string;
}
const ProfileImage = (props: Props) => {
  const { url, userId } = props;
  let img = url;
  if (!url) {
    img = portrait;
  }
  return <Image src={img} alt={userId ? `@${userId}` : `error`} />;
};

export default ProfileImage;

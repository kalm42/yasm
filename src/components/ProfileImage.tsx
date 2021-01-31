import styled from "styled-components";
import { Url } from "url";
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

  return <Image src={img} alt={userAt ? `@${userAt}` : `error`} />;
};

export default ProfileImage;

import { ServerTimestamp } from "../services/firebase";

export default interface FollowType {
  createdAt: ServerTimestamp;
  followed: string; // the user who is being followed
  follower: string; // the user who is following
}

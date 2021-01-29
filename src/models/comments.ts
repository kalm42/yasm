import firebase from "firebase/app";

export default interface CommentType {
  createdAt: firebase.firestore.FieldValue;
  text: string;
  authorId: string;
  score: number;
  replyCount: number;
}

import firebase from "firebase/app";
import { DocumentReference } from "../services/firebase";

export default interface PostType {
  _id: string; // document id of the post
  _ref: DocumentReference; //
  authorId: string; // the uid for the author
  createdAt: firebase.firestore.FieldValue;
  text: string; // duh
  commentCount: number; // count of comments on post
  score: number; // sum of thumbs up and thumbs down
}

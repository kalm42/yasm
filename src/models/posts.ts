import firebase from "firebase/app";

export default interface PostType {
  id: string; // doc id MUST be added to object
  authorAt: string; // the @ for the author
  authorId: string; // the uid for the author
  authorName: string; // duh
  createdAt: firebase.firestore.FieldValue;
  photoURL?: string; // the google profile url
  text: string; // duh
  comments?: number; // count of comments on post
  score: number; // sum of thumbs up and thumbs down
}

import { DocumentReference } from "../services/firebase";

// Duplicated in /functions/src/models.ts
export default interface UserType {
  _id: string; // the google and doc id
  _ref: DocumentReference;
  at: string; // their at
  name: string; // their name
  profileImage: string; // their google profile image
  bio: string; // duh
  links: string[]; // duh
}

import { DocumentReference } from "../services/firebase";
import { UserDocument } from "./document-models";

export type UserCallback = (T: UserType) => void;

// Duplicated in /functions/src/models.ts
export default interface UserType extends UserDocument {
  _id: string; // the google and doc id
  _ref: DocumentReference;
}

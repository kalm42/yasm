import { DocumentReference } from "../services/firebase";
import { PostDocument } from "./document-models";

export default interface PostType extends PostDocument {
  _id: string; // document id of the post
  _ref: DocumentReference; //
}

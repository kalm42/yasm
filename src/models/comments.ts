import { DocumentReference } from "../services/firebase";
import { CommentDocument } from "./document-models";

export type CommentsCallback = (comments: CommentType[]) => void;

export default interface CommentType extends CommentDocument {
  _id: string;
  _ref: DocumentReference;
}

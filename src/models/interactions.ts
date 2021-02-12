import { DocumentReference } from "../services/firebase";
import { InteractionDocument } from "./document-models";

export default interface InteractionType extends InteractionDocument {
  _id: string;
  _ref: DocumentReference;
}

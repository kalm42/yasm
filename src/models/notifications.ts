import { DocumentReference } from "../services/firebase";
import { NotificationDocument } from "./document-models";

export default interface NotificationType extends NotificationDocument {
  _id: string;
  _ref: DocumentReference;
}

import { DocumentReference, ServerTimestamp } from "../services/firebase";

export interface NewNotification {
  createdAt: ServerTimestamp; // for sorting notifications
  message: string; // the message to give the user
  userId: string; // the user to notify
  reference?: string; // Post Id or Comment Id
  hasRead: boolean; // if the user has read the notification
}

export default interface NotificationType extends NewNotification {
  _id: string;
  _ref: DocumentReference;
}

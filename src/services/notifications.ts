import { firestore, getServerTimestamp } from ".";
import { CommentType, NotificationType, PostType, UserType } from "../models";
import { NotificationDocument } from "../models/document-models";
import { QuerySnapshot } from "./firebase";

/**
 * Returns an array of notifications
 * @param query Firestore notification quert
 */
function aggregateNotifications(query: QuerySnapshot) {
  const notificationCollection: NotificationType[] = [];
  query.forEach((doc) => {
    const notification = doc.data() as NotificationType;
    notification._id = doc.id;
    notification._ref = doc;
    notificationCollection.push(notification);
  });
  return notificationCollection;
}

/**
 * Returns an array of the user's notifications
 * @param user Current user
 */
export function getMyNotifications(user: UserType) {
  return firestore
    .collection("notifications")
    .where("userId", "==", user._id)
    .where("hasRead", "==", false)
    .orderBy("createdAt", "desc")
    .limit(25)
    .get()
    .then(aggregateNotifications);
}

/**
 * Adds a notification for a user
 * @param user user to notifiy
 * @param doc Post or comment it relates to
 * @param text Message for the user
 */
export function writeNotification(
  userId: string,
  text: string,
  doc?: PostType | CommentType
) {
  const notification: NotificationDocument = {
    createdAt: getServerTimestamp(),
    hasRead: false,
    message: text,
    userId: userId,
  };
  if (doc) {
    notification.reference = doc._id;
  }
  return firestore.collection("notifications").add(notification);
}

export function updateNotifications(notifications: NotificationType[]) {
  const batch = firestore.batch();
  notifications.forEach((notification) => {
    batch.update(notification._ref.ref, { hasRead: true });
  });
  batch.commit();
}

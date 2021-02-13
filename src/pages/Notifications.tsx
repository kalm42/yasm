import { useEffect, useState } from "react";
import * as Sentry from "@sentry/react";
import { useUser } from "../context";
import { NotificationType } from "../models";
import { getMyNotifications, updateNotifications } from "../services";

const Notifications = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [markRead, setMarkRead] = useState<NotificationType[]>([]);

  const handleUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Checkbox value: ", event.target.checked);
    console.log("Which notification: ", event.target.name);
    if (!event.target.checked) return;
    const notification = notifications.filter(
      (n) => n._id === event.target.name
    )[0];
    setMarkRead([...markRead, notification]);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !markRead.length) return;
    updateNotifications(markRead);
    const readIds = markRead.map((r) => r._id);
    setNotifications(notifications.filter((n) => !readIds.includes(n._id)));
  };

  useEffect(() => {
    const getNotifications = async () => {
      console.log("Notifications:getNotifications");
      if (!user) return;
      try {
        setNotifications(await getMyNotifications(user));
      } catch (error) {
        console.warn("Notifications:getNotifications", error.message);
      }
    };
    getNotifications();
  }, [user]);

  return (
    <Sentry.ErrorBoundary fallback={FallbackNotificationsPage}>
      <div>
        <h1>Notifications</h1>
        <form onSubmit={handleSubmit}>
          <button type="submit">Mark as read</button>
          {notifications.map((notification) => (
            <div key={notification._id}>
              <input
                type="checkbox"
                name={notification._id}
                onChange={handleUpdate}
              />
              <label htmlFor={notification._id}>
                {notification.hasRead ? "read" : "not read"} -{" "}
                {notification.message}
              </label>
            </div>
          ))}
        </form>
      </div>
    </Sentry.ErrorBoundary>
  );
};

function FallbackNotificationsPage() {
  return (
    <div>
      <h1>Error: Notifications Page</h1>
      <p>
        An error has occured. Please refresh the page. If the error continues
        please contact support.
      </p>
    </div>
  );
}

export default Notifications;

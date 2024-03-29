import { useState } from "react";
import * as Sentry from "@sentry/react";
import { useAuth } from "../context";
import { firestore, updateUser } from "../services/firebase";

interface Props {
  at: string;
  isMe: boolean;
}

const UserId = (props: Props) => {
  const { at, isMe } = props;
  const { user } = useAuth();
  const [edit, setEdit] = useState(false);
  const [dirtyAt, setDirtyAt] = useState(at);
  const [isOriginal, setIsOriginal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    // check if another user has this id
    setDirtyAt(event.target.value);
    setLoading(true);
    firestore
      .collection("users")
      .where("id", "==", event.target.value)
      .get()
      .then((snapshot) => {
        console.log(snapshot.size);
        setLoading(false);
        setIsOriginal(!snapshot.size);
      });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isOriginal && user) {
      updateUser(user._id, user.name, dirtyAt).then(() => setEdit(false));
    }
  };

  const handleCancel = () => {
    setDirtyAt(at);
    setEdit(false);
  };

  return (
    <Sentry.ErrorBoundary fallback={FallbackUserId}>
      <div>
        <h2 id="at">User Name</h2>
        {edit ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="id"
              aria-labelledby="at"
              required
              value={dirtyAt}
              onChange={handleUpdate}
            />
            {loading ? "..." : isOriginal ? "og" : "dup"}
            <button type="submit">Save</button>
            <button type="reset" onClick={handleCancel}>
              Cancel
            </button>
          </form>
        ) : (
          <>
            <p>{at}</p>
            {isMe && <button onClick={() => setEdit(true)}>edit</button>}
          </>
        )}
      </div>
    </Sentry.ErrorBoundary>
  );
};

function FallbackUserId() {
  return (
    <div>
      <h1>Error: User</h1>
      <p>
        An error has occured. Please refresh the page. If the error continues
        please contact support.
      </p>
    </div>
  );
}

export default UserId;

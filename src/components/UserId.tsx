import { useState } from "react";
import { useAuth } from "../context";
import { firestore, updateDocument } from "../services/firebase";

interface Props {
  at: string;
  isMe: boolean;
}

const UserId = (props: Props) => {
  const { at, isMe } = props;
  const { user } = useAuth();
  const [edit, setEdit] = useState(false);
  const [dirtyId, setDirtyId] = useState(at);
  const [isOriginal, setIsOriginal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    // check if another user has this id
    setDirtyId(event.target.value);
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
    if (isOriginal) {
      updateDocument(`users/${user?._id}`, { id: dirtyId }).then(() =>
        setEdit(false)
      );
    }
  };

  const handleCancel = () => {
    setDirtyId(at);
    setEdit(false);
  };

  return (
    <div>
      <h2 id="at">User Name</h2>
      {edit ? (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="id"
            aria-labelledby="at"
            required
            value={dirtyId}
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
  );
};

export default UserId;

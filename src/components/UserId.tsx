import { useState } from "react";
import { useAuth } from "../context";
import { firestore, updateDocument } from "../services/firebase";

interface Props {
  uid: string;
  isMe: boolean;
}

const UserId = (props: Props) => {
  const { uid, isMe } = props;
  const { user } = useAuth();
  const [edit, setEdit] = useState(false);
  const [dirtyId, setDirtyId] = useState(uid);
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
      updateDocument(`users/${user?.uid}`, { id: dirtyId }).then(() =>
        setEdit(false)
      );
    }
  };

  const handleCancel = () => {
    setDirtyId(uid);
    setEdit(false);
  };

  return (
    <div>
      <h2 id="uid">User Name</h2>
      {edit ? (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="id"
            aria-labelledby="uid"
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
          <p>{uid}</p>
          {isMe && <button onClick={() => setEdit(true)}>edit</button>}
        </>
      )}
    </div>
  );
};

export default UserId;

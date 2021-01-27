import { useState } from "react";
import { useAuth } from "../context";
import { updateDocument } from "../services/firebase";

interface Props {
  bio: string;
  isMe: boolean;
}

const Biography = (props: Props) => {
  const { bio, isMe } = props;
  const { user } = useAuth();
  const [edit, setEdit] = useState(false);
  const [dirtyBio, setDirtyBio] = useState(bio);

  const handleUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDirtyBio(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateDocument(`users/${user?.uid}`, { bio: dirtyBio }).then(() =>
      setEdit(false)
    );
  };

  const handleCancel = () => {
    setDirtyBio(bio);
    setEdit(false);
  };

  return (
    <div>
      <h2 id="bio">Biography</h2>
      {edit ? (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="bio"
            aria-labelledby="bio"
            value={dirtyBio}
            onChange={handleUpdate}
          />
          <button type="submit">Save</button>
          <button type="reset" onClick={handleCancel}>
            Cancel
          </button>
        </form>
      ) : (
        <>
          <p>{bio}</p>
          {isMe && <button onClick={() => setEdit(true)}>edit</button>}
        </>
      )}
    </div>
  );
};

export default Biography;

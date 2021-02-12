import { useState } from "react";
import * as Sentry from "@sentry/react";
import { useUser } from "../context";
import { updateLinks } from "../services/firebase";

interface Props {
  links: string[];
  isMe: boolean;
}

const Links = (props: Props) => {
  const { links, isMe } = props;
  const { user } = useUser();
  const [add, setAdd] = useState(false);
  const [dirtyLinks, setDirtyLinks] = useState(links);
  const [link, setLink] = useState("");

  const handleAddUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLink(event.target.value);
  };
  const handleAddSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    const newLinkList = [...dirtyLinks, link];
    setDirtyLinks(newLinkList);
    updateLinks(user._id, newLinkList);
    setLink("");
    setAdd(false);
  };

  const handeEditSubmit = (originalLink: string, newLink: string) => {
    if (!user) return;
    const newLinkList = links.map((link) => {
      if (link === originalLink) {
        return newLink;
      }
      return link;
    });
    setDirtyLinks(newLinkList);
    return updateLinks(user._id, newLinkList);
  };

  const handleRemove = (linkToRemove: string) => {
    if (!user) return;
    const linkList = links.filter((link) => link !== linkToRemove);
    updateLinks(user._id, linkList);
  };

  return (
    <Sentry.ErrorBoundary fallback={FallbackLinks}>
      <div>
        <h2 id="links">Links</h2>
        <ul>
          {links.map((link, index) => {
            return (
              <Link
                key={index}
                update={handeEditSubmit}
                link={link}
                remove={handleRemove}
                isMe={isMe}
              />
            );
          })}
        </ul>
        {isMe &&
          (add ? (
            <form onSubmit={handleAddSubmit}>
              <label htmlFor="link">Link*:</label>
              <input
                type="url"
                name="link"
                value={link}
                required
                onChange={handleAddUpdate}
              />
              <button type="submit">Add</button>
            </form>
          ) : (
            <button onClick={() => setAdd(true)}>add</button>
          ))}
      </div>
    </Sentry.ErrorBoundary>
  );
};

function FallbackLinks() {
  return (
    <div>
      <h1>Error: Links</h1>
      <p>
        An error has occured. Please refresh the page. If the error continues
        please contact support.
      </p>
    </div>
  );
}

interface LinkProps {
  isMe: boolean;
  link: string;
  update: (originalLink: string, newLink: string) => Promise<void> | undefined;
  remove: (linkToRemove: string) => void;
}
function Link(props: LinkProps) {
  const { link, update, remove, isMe } = props;
  const [dirtyLink, setDirtyLink] = useState(link);
  const [edit, setEdit] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDirtyLink(event.target.value);
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    update(link, dirtyLink);
    setEdit(false);
  };

  const handleCancel = () => {
    setDirtyLink(link);
    setEdit(false);
  };

  const handleRemove = () => remove(link);

  return (
    <Sentry.ErrorBoundary fallback={FallbackLink}>
      {edit ? (
        <form onSubmit={handleSubmit}>
          <label htmlFor="link">Link*:</label>
          <input
            type="url"
            name="link"
            required
            value={dirtyLink}
            onChange={handleChange}
          />
          <button type="submit">Save</button>
          <button type="reset" onClick={handleCancel}>
            Cancel
          </button>
        </form>
      ) : (
        <li>
          {isMe && <button onClick={handleRemove}>r</button>}
          <a href={link} target="_blank" rel="noopener noreferrer">
            {link}
          </a>{" "}
          {isMe && <button onClick={() => setEdit(true)}>e</button>}
        </li>
      )}
    </Sentry.ErrorBoundary>
  );
}

function FallbackLink() {
  return (
    <div>
      <h1>Error: Link</h1>
      <p>
        An error has occured. Please refresh the page. If the problem continues
        please contact support.
      </p>
    </div>
  );
}

export default Links;

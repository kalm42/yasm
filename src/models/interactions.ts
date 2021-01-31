import { DocumentReference, ServerTimestamp } from "../services/firebase";

export type NewInteraction = InteractionBase | InteractionType;

interface InteractionBase {
  whoInteracted: string; // the uid of the user
  withWhat: string; // the id of the post or comment
  createdAt: ServerTimestamp;
}

export default interface InteractionType extends InteractionBase {
  _id: string;
  _ref: DocumentReference;
  bookmarked?: boolean; // posts only
  report?: string; // posts or comments
  vote?: boolean; // posts or comments
}

import { DocumentReference, ServerTimestamp } from "../services/firebase";

export interface NewComment {
  authorId: string;
  createdAt: ServerTimestamp;
  commentCount: number;
  score: number;
  level: number;
  parentId?: string;
  text: string;
}

export default interface CommentType extends NewComment {
  _id: string;
  _ref: DocumentReference;
}

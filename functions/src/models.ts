export interface ServerTimestamp {
  // https://firebase.google.com/docs/reference/android/com/google/firebase/Timestamp
  seconds: number;
  nanoseconds: number;
  compareTo: (s: ServerTimestamp) => number;
  describeContents: () => number;
  getNanoseconds: () => number;
  getSeconds: () => number;
  hashCode: () => number;
  now: () => ServerTimestamp;
  toDate: () => Date;
  toString: () => string;
}

export interface ReportDocument {
  text: string; // the complaint
  reportedBy: string; // who made it
  reported: string; // what was reported
  createdAt: ServerTimestamp;
}

export interface PostDocument {
  authorId: string; // the uid for the author
  createdAt: ServerTimestamp;
  text: string; // duh
  commentCount: number; // count of comments on post
  score: number; // sum of thumbs up and thumbs down
}

export interface NotificationDocument {
  createdAt: ServerTimestamp; // for sorting notifications
  message: string; // the message to give the user
  userId: string; // the user to notify
  reference?: string; // Post Id or Comment Id
  hasRead: boolean; // if the user has read the notification
}

export interface InteractionDocument {
  whoInteracted: string; // the uid of the user
  withWhat: string; // the id of the post or comment
  createdAt: ServerTimestamp;
  bookmarked?: boolean; // posts only
  report?: string; // posts or comments
  vote?: boolean; // posts or comments
}

export interface UserDocument {
  id: string;
  at: string;
  name: string;
  profileImage: string;
  bio: string;
  links: string[];
  postCount: number;
  followingCount: number;
  followerCount: number;
  score: number;
}

export interface CommentDocument {
  authorId: string;
  createdAt: ServerTimestamp;
  commentCount: number;
  score: number;
  level: number;
  parentId?: string;
  text: string;
}

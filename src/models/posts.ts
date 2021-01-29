export interface Post {
  id: string;
  authorAt: string;
  authorId: string;
  authorName: string;
  createdAt: { seconds: number; nanoseconds: number };
  photoURL?: string;
  text: string;
  comments?: number;
  score: number;
}

// Duplicated in /functions/src/models.ts
export interface User {
  id: string;
  name: string;
  profileImage: string;
  bio: string;
  links: string[];
}

export interface ExtendedUser extends User {
  uid: string;
}

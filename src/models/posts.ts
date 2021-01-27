export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  createdAt: { seconds: number; nanoseconds: number };
  profileImage?: string;
  text: string;
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

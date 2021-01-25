export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  createdAt: { seconds: number; nanoseconds: number };
  profileImage?: string;
  text: string;
}

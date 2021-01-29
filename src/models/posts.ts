export default interface PostType {
  id: string; // doc id MUST be added to object
  authorAt: string; // the @ for the author
  authorId: string; // the uid for the author
  authorName: string; // duh
  createdAt: { seconds: number; nanoseconds: number };
  photoURL?: string; // the google profile url
  text: string; // duh
  comments?: number; // count of comments on post
  score: number; // sum of thumbs up and thumbs down
}

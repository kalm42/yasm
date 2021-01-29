export default interface InteractionType {
  bookmarked?: boolean; // posts only
  report?: string; // posts or comments
  vote?: boolean; // posts or comments
  whoInteracted: string; // the uid of the user
  withWhat: string; // the id of the post or comment
}

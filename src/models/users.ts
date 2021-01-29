// Duplicated in /functions/src/models.ts
export default interface UserType {
  uid: string; // the google and doc id
  id: string; // their at
  name: string; // their name
  profileImage: string; // their google profile image
  bio: string; // duh
  links: string[]; // duh
}

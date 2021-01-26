/* eslint-disable-next-line no-unused-vars */
import { UserRecord } from "firebase-functions/lib/providers/auth";
/* eslint-disable-next-line no-unused-vars */
import { User } from "./models";
import admin from "./firebase-admin";

/**
 * Sends the new user to firestore for saving
 * @param {Object} user The new user object from buildUser
 */
export default async function createNewUser(user: UserRecord) {
  const usersRef = admin.firestore().collection("users");
  const newUser: User = {
    id: "",
    name: user.displayName || user.email?.split("@")[0] || "",
    profileImage: user.photoURL || "",
    bio: "",
    links: [],
  };

  try {
    await usersRef.add(newUser);
  } catch (error) {
    console.log(error);
  }
}

import { UserRecord } from "firebase-functions/lib/providers/auth";
import { UserDocument } from "./models";
import admin from "./firebase-admin";
import { v4 as uuidv4 } from "uuid";

/**
 * Sends the new user to firestore for saving
 * @param {Object} user The new user object from buildUser
 */
export default async function createNewUser(user: UserRecord): Promise<void> {
  const usersRef = admin.firestore().collection("users");
  const newUser: UserDocument = {
    id: "",
    at: uuidv4(),
    postCount: 0,
    followingCount: 0,
    followerCount: 0,
    score: 0,
    name: user.displayName || user.email?.split("@")[0] || "",
    profileImage: user.photoURL || "",
    bio: "",
    links: [],
  };

  try {
    await usersRef.doc(user.uid).set(newUser);
  } catch (error) {
    console.log("Cloud Functions: ", error.message);
  }
}

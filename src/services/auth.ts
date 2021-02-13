import firebase from "firebase/app";
import { auth, subscribeToUserWithId } from ".";
import { UserType } from "../models";

export function loginWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
}

export function signOut() {
  auth.signOut();
}

type AuthCallback = (T: UserType | null) => void;
export function subscribeToAuth(setState: AuthCallback) {
  firebase.auth().onAuthStateChanged((googleUser) => {
    if (googleUser) {
      subscribeToUserWithId(setState, googleUser.uid);
    } else {
      setState(null);
    }
  });
}

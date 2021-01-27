import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { User } from "../models/posts";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD98rn8YdEp3956xBCdRCsqBxxF6GyvD38",
  authDomain: "yasm-a0f22.firebaseapp.com",
  projectId: "yasm-a0f22",
  storageBucket: "yasm-a0f22.appspot.com",
  messagingSenderId: "193645775751",
  appId: "1:193645775751:web:09e5f4f2b027dc2cbda122",
  measurementId: "G-139TFVTM94",
};

firebase.initializeApp(FIREBASE_CONFIG);

export const auth = firebase.auth();
export const firestore = firebase.firestore();

export function updateDocument(path: string, value: object) {
  return firestore.doc(path).set(value, { merge: true });
}

interface ExtendedUser extends User {
  uid: string;
}
export function getUserWithId(id: string): Promise<ExtendedUser | null> {
  return firestore
    .collection("users")
    .where("id", "==", id)
    .get()
    .then((querySnapshot) => {
      let document: firebase.firestore.DocumentData | null = null;
      querySnapshot.forEach((doc) => {
        document = doc.data();
        document.uid = doc.id;
      });

      return document ? (document as ExtendedUser) : null;
    });
}

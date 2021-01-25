import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

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

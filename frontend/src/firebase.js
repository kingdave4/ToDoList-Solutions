// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2m10sCByDQgEqNh4AB86MKq7Bd6zC3Xc",
  authDomain: "betatask-7a243.firebaseapp.com",
  projectId: "betatask-7a243",
  storageBucket: "betatask-7a243.firebasestorage.app",
  messagingSenderId: "992305868471",
  appId: "1:992305868471:web:84521c66d64599662ce732",
  measurementId: "G-ZR47LS588H",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getAuth,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
 getDocs,
addDoc, 
updateDoc, 
deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

// 🔧 Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2U07u1C-gxdg2wk0Q9LUDgv958u8fN8Y",
  authDomain: "max-electronics-69ba2.firebaseapp.com",
  projectId: "max-electronics-69ba2",
  storageBucket: "max-electronics-69ba2.firebasestorage.app",
  messagingSenderId: "974351944204",
  appId: "1:974351944204:web:19131c9178499e51987c29"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Export all you use
export {
  auth,
  db,
  storage,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  collection,
  doc,
  setDoc,
  getDoc,
   getDocs,
  signOut,
addDoc, 
updateDoc, 
deleteDoc,
  ref,
  where,
    query,
  orderBy,
  uploadBytesResumable,
  getDownloadURL,
  serverTimestamp,
  onSnapshot
};

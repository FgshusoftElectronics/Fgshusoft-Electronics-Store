// ============================================================
// FIREBASE CLIENT
// ============================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    setDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp,
    limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut,
    updateProfile,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyDImp7cB7bM7WBrxjdP3gNVhdyDVg3mRzs",
  authDomain: "gths-kumba-sofati.firebaseapp.com",
  projectId: "gths-kumba-sofati",
  storageBucket: "gths-kumba-sofati.firebasestorage.app",
  messagingSenderId: "26166743494",
  appId: "1:26166743494:web:0309b7d043512cb7f1a2c7"
};


// ============================================================
// INITIALIZE FIREBASE
// ============================================================

const firebaseApp =
    initializeApp(firebaseConfig);


// ============================================================
// FIRESTORE
// ============================================================

const db =
    getFirestore(firebaseApp);


// ============================================================
// AUTHENTICATION
// ============================================================

const auth =
    getAuth(firebaseApp);


// ============================================================
// COLLECTIONS
// ============================================================

const COLLECTIONS = {

    products: "products",

    categories: "categories",

    brands: "brands",

    courses: "courses",

    projects: "projects",

    services: "services",

    testimonials: "testimonials",

    settings: "settings",

    orders: "orders",

    customers: "customers",

    clients: "clients",

    messages: "messages",

    subscribers: "subscribers"

};


// ============================================================
// EXPORTS
// ============================================================

export {

    firebaseApp,

    db,

    auth,

    COLLECTIONS,

    // Firestore
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    onSnapshot,
    query,
    where,
    addDoc,
    orderBy,
    limit,
    serverTimestamp,
    // Authentication
    createUserWithEmailAndPassword,
    updateProfile,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut

};

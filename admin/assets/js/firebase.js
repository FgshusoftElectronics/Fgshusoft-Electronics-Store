import { initializeApp } 
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
 
import { 
getAuth,
setPersistence,
browserLocalPersistence 
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD2U07u1C-gxdg2wk0Q9LUDgv958u8fN8Y",
  authDomain: "max-electronics-69ba2.firebaseapp.com",
  projectId: "max-electronics-69ba2",
  storageBucket: "max-electronics-69ba2.firebasestorage.app",
  messagingSenderId: "974351944204",
  appId: "1:974351944204:web:19131c9178499e51987c29"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
setPersistence( auth, browserLocalPersistence );
export const db = getFirestore(app);

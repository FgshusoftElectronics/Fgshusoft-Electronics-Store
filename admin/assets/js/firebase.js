
import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { getFirestore,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDImp7cB7bM7WBrxjdP3gNVhdyDVg3mRzs",
  authDomain: "gths-kumba-sofati.firebaseapp.com",
  projectId: "gths-kumba-sofati",
  storageBucket: "gths-kumba-sofati.firebasestorage.app",
  messagingSenderId: "26166743494",
  appId: "1:26166743494:web:0309b7d043512cb7f1a2c7"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export { getAuth };
export { firebaseConfig };

export { serverTimestamp };

export default app;



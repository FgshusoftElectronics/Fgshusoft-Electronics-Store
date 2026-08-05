import { auth } 
from "./firebase.js";

import {
signInWithEmailAndPassword,
signOut,
onAuthStateChanged
}
from 
"https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// LOGIN
export async function loginAdmin(
email,
password
){

return await signInWithEmailAndPassword(
    auth,
    email,
    password
);
}

// LOGOUT
export async function logoutAdmin(){
    await signOut(auth);
}

// CHECK LOGIN STATUS
export function checkAuth(){
onAuthStateChanged(
auth,
user=>{
if(!user){
location.href="login.html";
}
});


}

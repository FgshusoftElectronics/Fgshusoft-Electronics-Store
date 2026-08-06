import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
}
from 
"https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";



// =============================
// LOGIN ADMIN
// =============================

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




// =============================
// LOGOUT ADMIN
// =============================

export async function logoutAdmin(){

    await signOut(auth);

}




// =============================
// CHECK AUTH STATUS
// =============================

export function checkAuth(){

    return new Promise(
    (resolve, reject)=>{


        onAuthStateChanged(
        auth,
        (user)=>{


            if(user){

                resolve(user);

            }
            else{

                reject(
                    "User not authenticated"
                );

            }


        });


    });

}

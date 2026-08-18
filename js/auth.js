// ============================================================
// CLIENT AUTHENTICATION
// ============================================================

import {
    auth,
    db,
    COLLECTIONS,

    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,

    doc,
    setDoc,
    serverTimestamp
} from "./firebase-client.js";


// ============================================================
// REGISTER CLIENT
// ============================================================

export async function registerClient(
    name,
    email,
    password,
    phone,
    address
) {

    // --------------------------------------------------------
    // CREATE FIREBASE AUTH ACCOUNT
    // --------------------------------------------------------

    const credential =
        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );


    const user =
        credential.user;


    // --------------------------------------------------------
    // SAVE DISPLAY NAME
    // --------------------------------------------------------

    await updateProfile(
        user,
        {
            displayName: name
        }
    );


    // --------------------------------------------------------
    // CREATE CLIENT DOCUMENT
    // --------------------------------------------------------

    const clientRef =
        doc(
            db,
            COLLECTIONS.clients,
            user.uid
        );


    await setDoc(
        clientRef,
        {
        uid: user.uid,
        name: name,
        email: user.email,
        phone: phone,
        address: address,
        role: "client",
        createdAt:
                serverTimestamp(),
        updatedAt:
                serverTimestamp()

        }
    );


    return user;
}


// ============================================================
// LOGIN CLIENT
// ============================================================

export async function loginClient(
    email,
    password
) {

    const credential =
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


    return credential.user;
}


// ============================================================
// LOGOUT CLIENT
// ============================================================

export async function logoutClient() {

    await signOut(auth);

}


// ============================================================
// CURRENT CLIENT
// ============================================================

export function getCurrentClient() {

    return auth.currentUser;

}


// ============================================================
// AUTH STATE
// ============================================================

export function watchClientAuth(callback) {

    return onAuthStateChanged(
        auth,
        callback
    );

}

// ============================================================
// CLIENT AUTH
// Fgshusoft Electronics Tech
// ============================================================

import {
    auth,
    db,
    COLLECTIONS,
    doc,
    getDoc,
    setDoc,
    onAuthStateChanged,
    signOut
} from "./firebase-client.js";



// ============================================================
// GET CURRENT CLIENT FIRESTORE PROFILE
// clients/{uid}
// ============================================================

export async function getCurrentClientData() {

    const user = auth.currentUser;

    if (!user) {

        console.warn(
            "getCurrentClientData(): No authenticated user."
        );

        return null;

    }


    try {

        const userRef =
            doc(
                db,
                "clients",
                user.uid
            );


        const snapshot =
            await getDoc(userRef);


        if (!snapshot.exists()) {

            console.warn(
                "User document does not exist:",
                `clients/${user.uid}`
            );

            return null;

        }


        const data =
            snapshot.data();


        return {

            id:
                snapshot.id,

            uid:
                data.uid ||
                user.uid,

            email:
                data.email ||
                user.email ||
                "",

            name:
                data.name ||
                user.displayName ||
                user.email?.split("@")[0] ||
                "Client",

            phone:
                data.phone ||
                "",

            address:
                data.address ||
                "",

            role:
                data.role ||
                "client",

            createdAt:
                data.createdAt ||
                null,

            updatedAt:
                data.updatedAt ||
                null

        };

    }

    catch (error) {

        console.error(
            "Failed to load clients/{uid}:",
            error
        );

        throw error;

    }

}


// ============================================================
// CREATE / UPDATE CLIENT PROFILE
// ============================================================

export async function saveClientProfile(
    data = {}
) {

    const user =
        auth.currentUser;


    if (!user) {

        throw new Error(
            "No authenticated client."
        );

    }


    const clientRef =
        doc(
            db,
            COLLECTIONS.clients,
            user.uid
        );


    const existing =
        await getDoc(clientRef);


    const clientData = {

        uid:
            user.uid,

        email:
            data.email ||
            user.email ||
            "",

        name:
            data.name ||
            user.displayName ||
            "",

        phone:
            data.phone ||
            "",

        address:
            data.address ||
            "",

        ...data,

        updatedAt:
            new Date()

    };


    // Add creation timestamp
    // only for a new client

    if (!existing.exists()) {

        clientData.createdAt =
            new Date();

    }


    await setDoc(
        clientRef,
        clientData,
        {
            merge: true
        }
    );


    console.log(
        "Client profile saved:",
        clientData
    );


    return clientData;

}


// ============================================================
// WATCH CLIENT AUTHENTICATION
// ============================================================

export function watchClientAuth(
    callback
) {

    if (
        typeof callback !==
        "function"
    ) {

        throw new Error(
            "watchClientAuth requires a callback function."
        );

    }


    return onAuthStateChanged(
        auth,
        callback
    );

}


// ============================================================
// LOGOUT CLIENT
// ============================================================

export async function logoutClient() {

    try {

        await signOut(auth);

        console.log(
            "Client logged out successfully."
        );

    }

    catch (error) {

        console.error(
            "Client logout failed:",
            error
        );

        throw error;

    }

}

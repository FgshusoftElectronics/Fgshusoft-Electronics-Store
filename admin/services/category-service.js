import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { db } from "../assets/js/firebase.js";

// =============================
// Categories Collection
// =============================

const categoriesRef = collection(
    db,
    "categories"
);


// =============================
// GET ALL CATEGORIES
// =============================

export async function getCategories(){

    const snapshot =
    await getDocs(categoriesRef);


    return snapshot.docs.map(
        document=>({

            id: document.id,

            ...document.data()

        })
    );

}



// =============================
// GET SINGLE CATEGORY
// =============================

export async function getCategory(id){

    const ref =
    doc(
        db,
        "categories",
        id
    );


    const snapshot =
    await getDoc(ref);


    if(!snapshot.exists()){

        throw new Error(
            "Category not found"
        );

    }


    return {

        id:snapshot.id,

        ...snapshot.data()

    };

}



// =============================
// ADD CATEGORY
// =============================

export async function addCategory(category){

    return await addDoc(
        categoriesRef,
        {

            ...category,

            createdAt:
            serverTimestamp(),

            updatedAt:
            serverTimestamp()

        }
    );

}



// =============================
// UPDATE CATEGORY
// =============================

export async function updateCategory(
    id,
    data
){

    const ref =
    doc(
        db,
        "categories",
        id
    );


    return await updateDoc(
        ref,
        {

            ...data,

            updatedAt:
            serverTimestamp()

        }
    );

}



// =============================
// DELETE CATEGORY
// =============================

export async function removeCategory(id){

    return await deleteDoc(
        doc(
            db,
            "categories",
            id
        )
    );

}

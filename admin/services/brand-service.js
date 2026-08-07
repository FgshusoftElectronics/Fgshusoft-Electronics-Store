import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
}
from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import { db }
from "../assets/js/firebase.js";


// =============================
// Brands Collection
// =============================

const brandsRef =
collection(
    db,
    "brands"
);


// =============================
// GET ALL BRANDS
// =============================

export async function getBrands(){

    const q =
    query(
        brandsRef,
        orderBy(
            "name",
            "asc"
        )
    );

    const snapshot =
    await getDocs(q);

    return snapshot.docs.map(
        document=>({

            id:document.id,

            ...document.data()

        })
    );

}


// =============================
// GET BRAND
// =============================

export async function getBrand(id){

    const ref =
    doc(
        db,
        "brands",
        id
    );

    const snapshot =
    await getDoc(ref);

    if(!snapshot.exists()){

        throw new Error(
            "Brand not found."
        );

    }

    return{

        id:snapshot.id,

        ...snapshot.data()

    };

}


// =============================
// ADD BRAND
// =============================

export async function addBrand(brand){

    return await addDoc(

        brandsRef,

        {

            ...brand,

            createdAt:
            serverTimestamp(),

            updatedAt:
            serverTimestamp()

        }

    );

}


// =============================
// UPDATE BRAND
// =============================

export async function updateBrand(
    id,
    data
){

    const ref =
    doc(
        db,
        "brands",
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
// DELETE BRAND
// =============================

export async function removeBrand(id){

    return await deleteDoc(

        doc(
            db,
            "brands",
            id
        )

    );

}

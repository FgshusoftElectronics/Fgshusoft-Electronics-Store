import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    query,
    orderBy
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


import { db } from "../assets/js/firebase.js";


// =============================
// Products Collection
// =============================

const productsRef =
collection(
    db,
    "products"
);



// =============================
// GET ALL PRODUCTS
// =============================

export async function getProducts(){

    try{

        const q =
        query(
            productsRef,
            orderBy(
                "createdAt",
                "desc"
            )
        );


        const snapshot =
        await getDocs(q);


        return snapshot.docs.map(
            document=>({

                id: document.id,

                ...document.data()

            })
        );


    }
    catch(error){

        console.error(
            "Loading products failed:",
            error
        );

        throw error;

    }

}




// =============================
// GET SINGLE PRODUCT
// =============================

export async function getProduct(id){

    try{

        const ref =
        doc(
            db,
            "products",
            id
        );


        const snapshot =
        await getDoc(ref);



        if(!snapshot.exists()){

            throw new Error(
                "Product not found"
            );

        }



        return {

            id:snapshot.id,

            ...snapshot.data()

        };


    }
    catch(error){

        console.error(
            "Getting product failed:",
            error
        );

        throw error;

    }

}




// =============================
// ADD PRODUCT
// =============================

export async function addProduct(product){

    try{

        return await addDoc(

            productsRef,

            {

                ...product,

                createdAt:
                serverTimestamp(),


                updatedAt:
                serverTimestamp()

            }

        );


    }
    catch(error){

        console.error(
            "Adding product failed:",
            error
        );

        throw error;

    }

}




// =============================
// UPDATE PRODUCT
// =============================

export async function updateProduct(
    id,
    data
){

    try{

        const ref =
        doc(
            db,
            "products",
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
    catch(error){

        console.error(
            "Updating product failed:",
            error
        );

        throw error;

    }

}




// =============================
// DELETE PRODUCT
// =============================

export async function removeProduct(id){

    try{

        return await deleteDoc(

            doc(
                db,
                "products",
                id
            )

        );


    }
    catch(error){

        console.error(
            "Deleting product failed:",
            error
        );

        throw error;

    }

}

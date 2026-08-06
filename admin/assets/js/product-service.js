import {
collection,
addDoc,
getDocs,
deleteDoc,
doc,
serverTimestamp
}
from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
  
import {db} from "./firebase.js";
 
const productsRef = collection( db, "products" );
 
// GET PRODUCTS
export async function getProducts(){
const snapshot = await getDocs( productsRef );
return snapshot.docs.map( doc=>({ id:doc.id, ...doc.data()}) );
}
 
// ADD PRODUCT

export async function addProduct( product ){
return await addDoc( productsRef,
{
...product,
createdAt:
serverTimestamp()
}
);
}

// DELETE PRODUCT
export async function removeProduct( id
){
await deleteDoc( doc( db, "products", id ) );
}

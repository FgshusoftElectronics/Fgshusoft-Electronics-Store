import {
    getProducts,
    getProduct,
    addProduct,
    updateProduct,
    removeProduct
}
from "../../services/product-service.js";

import {
    getBrands
}
from "../../services/brand-service.js";

/*
import {
    uploadImage
}
from "../../services/storage-service.js";
*/
import {
    convertImageToBase64
}
from "../../services/storage-service.js";

import {
    getCategories
}
from "../../services/category-service.js";

// =============================
// GLOBAL STATE
// =============================

let allProducts = [];
let categoryCache = {};
let editingProductId = null;
let brandCache = {};


// =========================
// DOM ELEMENTS
// =========================
const table =
document.getElementById(
    "productsTable"
);

const saveButton =
document.getElementById(
    "saveProduct"
);

const searchInput =
document.getElementById(
    "searchProduct"
);

const categoryFilter =
document.getElementById(
    "categoryFilter"
);

const brandFilter =
document.getElementById(
    "productBrand1"
);

const productBrand =
document.getElementById(
"productBrand"
);

const productName =
document.getElementById(
    "productName"
);

const productCategory =
document.getElementById(
    "productCategory"
);

const productPrice =
document.getElementById(
    "productPrice"
);

const productStock =
document.getElementById(
    "productStock"
);

const modalTitle =
document.querySelector(
"#productModal .modal-title"
);

const modalElement =
document.getElementById(
"productModal"
);

const modal =
modalElement
?
new bootstrap.Modal(modalElement)
:
null;

const imageInput =
document.getElementById(
"productImage"
);

const imagePreview =
document.getElementById(
"imagePreview"
);

// =============================
// LOAD PRODUCTS
// =============================

async function loadProducts(){

try{

allProducts =
await getProducts();


renderProducts(
allProducts
);


}
catch(error){

Swal.fire({

icon:"error",

title:"Loading Error",

text:error.message

});

}

}



// =============================
// LOAD CATEGORIES
// =============================

async function loadCategories(){

try{


const categories =
await getCategories();



categoryCache = {};



categories.forEach(category=>{

categoryCache[category.id] =
category.name;

});



// Product modal dropdown

if(productCategory){


productCategory.innerHTML = `

<option value="">
Select category
</option>

`;


categories.forEach(category=>{


productCategory.innerHTML += `

<option value="${category.id}">

${category.name}

</option>

`;


});


}



// Filter dropdown

if(categoryFilter){


categoryFilter.innerHTML = `

<option value="all">
All Categories
</option>

`;



categories.forEach(category=>{


categoryFilter.innerHTML += `

<option value="${category.id}">

${category.name}

</option>

`;

});


}


}
catch(error){


Swal.fire({

icon:"error",

title:"Category Error",

text:error.message

});


}

}

// =============================
// LOAD BRAND DROPDOWN
// =============================

async function loadBrands(){

    try{

        const brands =
        await getBrands();


        brandCache = {};


        brands.forEach(brand=>{

            brandCache[brand.id] =
            brand.name;

        });



        const select =
        document.getElementById(
            "productBrand"
        );
        const select1 =
        document.getElementById(
            "productBrand1"
        );

        if(select){

           select1.innerHTML =  `
            <option value="all">
                Select brand
            </option>
            `;
          select.innerHTML = `
            <option value="">
                Select brand
            </option>
            `;
            
            brands.forEach(brand=>{
    select1.innerHTML += `
                <option value="${brand.id}">
                    ${brand.name}
                </option>
                `;
    select.innerHTML += `
    <option value="${brand.id}">
     ${brand.name}
     </option>
    `;           
            });
        }
    }
    catch(error){

        Swal.fire({

            icon:"error",

            title:"Brands Loading Failed",

            text:error.message

        });

    }

}

// =============================
// RENDER PRODUCTS
// =============================

function renderProducts(products){


if(!table)
return;



table.innerHTML = "";



if(products.length === 0){


table.innerHTML = `

<tr>

<td colspan="7"
class="text-center text-muted">

No products found

</td>

</tr>

`;

return;

}




products.forEach(product=>{


table.innerHTML += `

<tr>


<td>

${
product.thumbnail

?

`

<img

src="${product.thumbnail}"

width="45"

class="rounded">

`

:

`

<i class="fa-solid fa-box"></i>

`

}

</td>



<td class="fw-bold">

${product.name}

</td>



<td>

${categoryCache[product.categoryId] || "-"}

</td>

<td>
${brandCache[product.brandId] || "-"}
</td>

<td>

${Number(product.price)
.toLocaleString()} FCFA

</td>



<td>

${
product.stock <= 0

?

`

<span class="badge bg-danger">

Out of Stock

</span>

`

:

product.stock <= 5

?

`

<span class="badge bg-warning text-dark">

Low Stock

</span>

`

:

`

<span class="badge bg-success">

${product.stock} Available

</span>

`

}

</td>



<td>

<span class="badge bg-success">

${product.status}

</span>

</td>



<td>


<button

class="btn btn-warning btn-sm me-1 edit-product"

data-id="${product.id}">

<i class="fa-solid fa-pen"></i>

</button>



<button

class="btn btn-danger btn-sm delete-product"

data-id="${product.id}">

<i class="fa-solid fa-trash"></i>

</button>


</td>


</tr>

`;

});


}

// =============================
// TABLE ACTIONS
// =============================

if(table){

table.addEventListener(
"click",
async e=>{


const editButton =
e.target.closest(
".edit-product"
);



if(editButton){


const id =
editButton.dataset.id;


await editProduct(id);


return;

}




const deleteButton =
e.target.closest(
".delete-product"
);



if(!deleteButton)
return;



const id =
deleteButton.dataset.id;



const result =
await Swal.fire({

title:"Delete Product?",

text:"This action cannot be undone",

icon:"warning",

showCancelButton:true,

confirmButtonText:"Yes, delete",

cancelButtonText:"Cancel"

});



if(result.isConfirmed){


try{


await removeProduct(id);



Swal.fire({

icon:"success",

title:"Deleted",

text:"Product removed",

timer:1200,

showConfirmButton:false

});



loadProducts();



}
catch(error){


Swal.fire({

icon:"error",

title:"Delete Failed",

text:error.message

});


}


}



});

}






// =============================
// EDIT PRODUCT
// =============================

async function editProduct(id){


try{

const product =
await getProduct(id);
editingProductId = id;
productName.value =
product.name || "";

productCategory.value =
product.categoryId || "";

productPrice.value =
product.price || "";

productStock.value =
product.stock || "";

productBrand.value =
product.brandId || "";

// Existing image

if(imagePreview &&
product.thumbnail){


imagePreview.src =
product.thumbnail;


imagePreview.style.display =
"block";


}




if(modalTitle){


modalTitle.innerHTML = `

<i class="fa-solid fa-pen"></i>

Edit Product

`;

}



if(saveButton){


saveButton.innerHTML = `

<i class="fa-solid fa-save"></i>

Update Product

`;

}



if(modal)
modal.show();



}
catch(error){


Swal.fire({

icon:"error",

title:"Edit Failed",

text:error.message

});


}


}




// =============================
// RESET FORM
// =============================

function resetForm(){


editingProductId = null;



if(productName)
productName.value = "";



if(productCategory)
productCategory.value = "";



if(productPrice)
productPrice.value = "";



if(productStock)
productStock.value = "";



if(imageInput)
imageInput.value = "";



if(imagePreview){


imagePreview.src = "";

imagePreview.style.display =
"none";

}



if(modalTitle){


modalTitle.innerHTML = `

<i class="fa-solid fa-box"></i>

Add Product

`;

}



if(saveButton){


saveButton.innerHTML = `

<i class="fa-solid fa-save"></i>

Save Product

`;

}


}




// =============================
// OPEN ADD PRODUCT
// =============================

const addProductBtn =
document.getElementById(
"addProductBtn"
);



if(addProductBtn){


addProductBtn.addEventListener(
"click",
()=>{


resetForm();



if(modal)
modal.show();


});

}






// ==========================
// SAVE PRODUCT
// ==========================
if(saveButton){


saveButton.addEventListener(
"click",
async()=>{

try{

let imageUrl = "";

// Keep old image when editing
if(editingProductId){
    const oldProduct =
    await getProduct(
        editingProductId
    );
    imageUrl =
    oldProduct.thumbnail || "";
}

// Upload new image if selected

if(
imageInput &&
imageInput.files[0]
){

/*
    imageUrl =
    await uploadImage(
        imageInput.files[0]
    );*/

imageUrl =
await convertImageToBase64(
    imageInput.files[0]
);

}

const product = {
name:
productName.value.trim(),
categoryId:
productCategory.value,
brandId:
document.getElementById(
    "productBrand"
).value,

price:
Number(productPrice.value),
stock:
Number(productStock.value),
thumbnail:
imageUrl,
type:"product",
status:"active",
visible:true
};

if(!product.name){
Swal.fire(
"Missing Name",
"Enter product name",
"warning"
);
return;
}

if(editingProductId){
await updateProduct( editingProductId, product );
}
else{
await addProduct(product);
}

Swal.fire({
icon:"success",
title:
editingProductId
?
"Product Updated" : "Product Added",
timer:1200,

showConfirmButton:false

});

resetForm();

if(modal)
modal.hide();



loadProducts();



}
catch(error){


Swal.fire({

icon:"error",

title:"Save Failed",

text:error.message

});


}


});

}

// =============================
// SEARCH & FILTER
// =============================

function filterProducts(){
const text =
searchInput
?
searchInput.value
.toLowerCase()
:
"";


const category =
categoryFilter
?
categoryFilter.value
:
"all";

const brand = brandFilter ?
brandFilter.value :
"all";

const filtered =
allProducts.filter(product=>{

const matchText =
product.name
.toLowerCase()
.includes(text);

const matchCategory =
category==="all" ||
product.categoryId === category;

const matchBrand =
brand==="all" ||
product.brandId === brand;

return matchText &&
matchCategory && matchBrand;
});
 
renderProducts(filtered);
}


// =============================
// IMAGE PREVIEW
// =============================

if(imageInput){
imageInput.addEventListener(
"change",
()=>{
const file =
imageInput.files[0];

if(file &&
imagePreview){

const reader =
new FileReader();

reader.onload =
e=>{
imagePreview.src =
e.target.result;

imagePreview.style.display =
"block";
};

reader.readAsDataURL(file);
}
});

}


/////Search and Filters //////
if(searchInput){
searchInput.addEventListener(
"input",
filterProducts
);
}
//////////////////////
if(categoryFilter){
categoryFilter.addEventListener(
"change",
filterProducts
);
}
////////////////
if(brandFilter){
brandFilter.addEventListener(
"change",
filterProducts
);
}
// =========================
// INITIALIZE
// =========================

loadCategories();
loadBrands();
loadProducts();




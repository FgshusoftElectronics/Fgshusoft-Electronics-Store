import {
    getBrands,
    getBrand,
    addBrand,
    updateBrand,
    removeBrand
}
from "../../services/brand-service.js";


import {
    convertImageToBase64
}
from "../../services/storage-service.js";


// =============================
// VARIABLES
// =============================

let allBrands = [];

let editingBrandId = null;


// =============================
// ELEMENTS
// =============================

const table =
document.getElementById(
    "brandsTable"
);


const searchInput =
document.getElementById(
    "searchBrand"
);


const saveButton =
document.getElementById(
    "saveBrand"
);


const addButton =
document.getElementById(
    "addBrandBtn"
);


const modal =
new bootstrap.Modal(
    document.getElementById(
        "brandModal"
    )
);


const modalTitle =
document.querySelector(
"#brandModal .modal-title"
);


// Inputs

const brandName =
document.getElementById(
"brandName"
);

const brandCountry =
document.getElementById(
"brandCountry"
);

const brandWebsite =
document.getElementById(
"brandWebsite"
);

const brandStatus =
document.getElementById(
"brandStatus"
);

const brandDescription =
document.getElementById(
"brandDescription"
);

const brandLogo =
document.getElementById(
"brandLogo"
);

const logoPreview =
document.getElementById(
"brandLogoPreview"
);




// =============================
// LOAD BRANDS
// =============================

async function loadBrands(){

try{


allBrands =
await getBrands();


renderBrands(
allBrands
);


}
catch(error){


Swal.fire(
"Error",
error.message,
"error"
);


}


}




// =============================
// RENDER TABLE
// =============================

function renderBrands(brands){


table.innerHTML="";



if(brands.length===0){


table.innerHTML=`

<tr>

<td colspan="6"
class="text-center text-muted">

No brands found

</td>

</tr>

`;

return;

}




brands.forEach(
brand=>{


table.innerHTML += `

<tr>


<td>

${
brand.logo

?

`<img src="${brand.logo}"
width="45"
class="rounded">`

:

`<i class="fa-solid fa-tags"></i>`

}

</td>



<td class="fw-bold">

${brand.name}

</td>



<td>

${brand.country || "-"}

</td>



<td>

${brand.website || "-"}

</td>



<td>

<span class="badge ${
brand.status==="active"
?
"bg-success"
:
"bg-secondary"
}">

${brand.status}

</span>

</td>



<td>


<button
class="btn btn-warning btn-sm edit-brand"
data-id="${brand.id}">

<i class="fa-solid fa-pen"></i>

</button>


<button
class="btn btn-danger btn-sm delete-brand"
data-id="${brand.id}">

<i class="fa-solid fa-trash"></i>

</button>


</td>



</tr>

`;

});


}





// =============================
// ADD / UPDATE
// =============================

saveButton.addEventListener(
"click",
async()=>{


try{


let logo = "";



if(brandLogo.files[0]){


logo =
await convertImageToBase64(
brandLogo.files[0]
);


}




const data = {


name:
brandName.value.trim(),


country:
brandCountry.value.trim(),


website:
brandWebsite.value.trim(),


status:
brandStatus.value,


description:
brandDescription.value,


logo

};




if(!data.name){


Swal.fire(
"Missing Name",
"Enter brand name",
"warning"
);


return;

}




if(editingBrandId){


await updateBrand(
editingBrandId,
data
);


}
else{


await addBrand(
data
);


}




Swal.fire({

icon:"success",

title:
editingBrandId
?
"Brand Updated"
:
"Brand Added",

timer:1200,

showConfirmButton:false

});



resetForm();

modal.hide();

loadBrands();



}
catch(error){


Swal.fire(
"Save Failed",
error.message,
"error"
);


}



});






// =============================
// TABLE ACTIONS
// =============================

table.addEventListener(
"click",
async e=>{


const edit =
e.target.closest(
".edit-brand"
);


if(edit){


editBrand(
edit.dataset.id
);


return;

}




const del =
e.target.closest(
".delete-brand"
);


if(!del)
return;



const result =
await Swal.fire({

title:"Delete Brand?",

text:"This cannot be undone",

icon:"warning",

showCancelButton:true

});



if(result.isConfirmed){


await removeBrand(
del.dataset.id
);


loadBrands();


}



});






// =============================
// EDIT
// =============================

async function editBrand(id){


const brand =
await getBrand(id);



editingBrandId=id;


brandName.value =
brand.name || "";


brandCountry.value =
brand.country || "";


brandWebsite.value =
brand.website || "";


brandStatus.value =
brand.status || "active";


brandDescription.value =
brand.description || "";



if(brand.logo){


logoPreview.src =
brand.logo;


logoPreview.style.display =
"block";


}



modalTitle.innerHTML = `

<i class="fa-solid fa-pen"></i>

Edit Brand

`;


saveButton.innerHTML = `

<i class="fa-solid fa-save"></i>

Update Brand

`;



modal.show();


}




// =============================
// RESET
// =============================

function resetForm(){


editingBrandId=null;


brandName.value="";

brandCountry.value="";

brandWebsite.value="";

brandDescription.value="";


brandStatus.value="active";


brandLogo.value="";


logoPreview.src="";

logoPreview.style.display="none";



modalTitle.innerHTML = `

<i class="fa-solid fa-tags"></i>

Add Brand

`;


saveButton.innerHTML = `

<i class="fa-solid fa-save"></i>

Save Brand

`;

}





// =============================
// SEARCH
// =============================

searchInput.addEventListener(
"input",
()=>{


const value =
searchInput.value
.toLowerCase();



const filtered =
allBrands.filter(
brand=>

brand.name
.toLowerCase()
.includes(value)

);



renderBrands(filtered);



});






// =============================
// IMAGE PREVIEW
// =============================

brandLogo.addEventListener(
"change",
()=>{


const file =
brandLogo.files[0];


if(file){


const reader =
new FileReader();


reader.onload =
e=>{


logoPreview.src =
e.target.result;


logoPreview.style.display =
"block";


};

reader.readAsDataURL(file);

}
});

// =============================
// ADD BUTTON
// =============================

addButton.addEventListener(
"click",
()=>{


resetForm();

modal.show();


});





// START

loadBrands();

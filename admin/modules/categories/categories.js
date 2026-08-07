import {
    getCategories,
    addCategory,
    updateCategory,
    removeCategory
}
from "../../services/category-service.js";


// =============================
// Elements
// =============================
let editingId = null;

const table =
document.getElementById("categoryTable");


const saveBtn =
document.getElementById("saveCategory");


// =============================
// Alert Helper
// =============================

function alertBox(
    icon,
    title,
    text
){

    Swal.fire({
        icon,
        title,
        text
    });

}



// =============================
// LOAD CATEGORIES
// =============================

async function loadCategories(){

    try{

        const categories =
        await getCategories();


        renderCategories(categories);


    }
    catch(error){

        alertBox(
            "error",
            "Loading Failed",
            error.message
        );

    }

}



// =============================
// DISPLAY TABLE
// =============================

function renderCategories(
    categories
){


    table.innerHTML = "";


    if(categories.length === 0){

        table.innerHTML = `

        <tr>

        <td 
        colspan="5"
        class="text-center text-muted">

        No categories found

        </td>

        </tr>

        `;

        return;

    }



    categories.forEach(category=>{


        table.innerHTML += `

        <tr>


        <td>

        <i class="fa-solid 
        ${category.icon || "fa-tag"} 
        text-primary fs-4">

        </i>

        </td>



        <td class="fw-bold">

        ${category.name}

        </td>



        <td>

        ${category.description || "-"}

        </td>



        <td>

        <span class="badge bg-success">

        Active

        </span>

        </td>


<td>

<button
class="btn btn-sm btn-warning me-1"
onclick="editCategory('${category.id}')">

<i class="fa-solid fa-pen"></i>

</button>


<button
class="btn btn-sm btn-danger"
onclick="deleteCategory('${category.id}')">

<i class="fa-solid fa-trash"></i>

</button>


</td>


        </tr>

        `;


    });


}




// =============================
// SAVE CATEGORY
// =============================

saveBtn.addEventListener(
"click",
async()=>{


    const name =
    document.getElementById(
        "categoryName"
    ).value.trim();



    const icon =
    document.getElementById(
        "categoryIcon"
    ).value.trim();



    const description =
    document.getElementById(
        "categoryDescription"
    ).value.trim();



    if(!name){

        alertBox(
            "warning",
            "Missing Name",
            "Enter category name"
        );

        return;

    }



    try{


        //await addCategory({
const categoryData = {
            name,

            slug:
            name
            .toLowerCase()
            .replaceAll(" ","-"),

            icon,

            description,

            visible:true,

            featured:false,

            status:"active"

        };

if(editingId){
    await updateCategory(
        editingId,
        categoryData
    );
}
else{
    await addCategory(
        categoryData
    );
}


        alertBox(
            "success",
            "Saved",
            "Category added successfully"
        );


editingId = null;


document.querySelector(
".modal-title"
).innerHTML = `

<i class="fa-solid fa-tags"></i>
New Category

`;

        document
        .getElementById(
            "categoryName"
        ).value="";



        loadCategories();



    }
    catch(error){


        alertBox(
            "error",
            "Error",
            error.message
        );


    }


});


// =============================
// DELETE CATEGORY
// =============================

window.deleteCategory =
async function(id){


    const result =
    await Swal.fire({

        title:"Delete Category?",

        text:
        "This action cannot be undone",

        icon:"warning",

        showCancelButton:true,

        confirmButtonText:"Delete"

    });



    if(result.isConfirmed){


        await removeCategory(id);



        Swal.fire(
            "Deleted",
            "Category removed",
            "success"
        );



        loadCategories();


    }

};


window.editCategory =
async function(id){


    const categories =
    await getCategories();


    const category =
    categories.find(
        item=>item.id===id
    );


    if(!category) return;


    editingId = id;


    document.getElementById(
        "categoryName"
    ).value =
    category.name;



    document.getElementById(
        "categoryIcon"
    ).value =
    category.icon || "";



    document.getElementById(
        "categoryDescription"
    ).value =
    category.description || "";



    document.querySelector(
        ".modal-title"
    ).innerHTML = `

    <i class="fa-solid fa-pen"></i>
    Edit Category

    `;


    new bootstrap.Modal(
        document.getElementById(
            "categoryModal"
        )
    ).show();


};


// =============================
// START
// =============================

loadCategories();

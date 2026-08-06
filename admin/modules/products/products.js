import {
getProducts,
removeProduct
}
from
"../../assets/js/product-service.js";

const table = document.getElementById(
"productsTable"
);

async function loadProducts(){
const products = await getProducts();

table.innerHTML="";
products.forEach(product=>{
table.innerHTML += `
<tr>
<td>
${product.name}
</td>
<td>
${product.category}
</td>
<td>
${product.price} FCFA
</td>
<td>
${product.stock}
</td>
<td>
<button
class="btn btn-danger btn-sm"
data-id="${product.id}">
<i class="fa fa-trash"></i>
</button>
</td>
</tr>
`;
});
}

table.addEventListener(
"click",
async e=>{
if(
e.target.closest("button")
){

const id = e.target.closest("button").dataset.id;
await removeProduct(id);
loadProducts();
}
});

loadProducts();

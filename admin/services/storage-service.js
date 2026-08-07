// =============================
// IMAGE SERVICE
// Base64 image conversion
// =============================
export function convertImageToBase64(file){
    return new Promise(
    (resolve,reject)=>{

        if(!file){
            reject(
                new Error(
                    "No image selected"
                )
            );
            return;

        }

        const reader =
        new FileReader();

        reader.onload =
        ()=>{
            resolve(
                reader.result
            );
        };

        reader.onerror =
        ()=>{
            reject(
                new Error(
                    "Image conversion failed"
                )
            );

        };

        reader.readAsDataURL(file);
    });

}

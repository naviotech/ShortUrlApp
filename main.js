//nav desplegable mobile
let burguer = document.querySelector(".icon-nav-mobile");
const boton = document.querySelector("#button");
const urlValid = document.querySelector(".url-entrada");
let listaUrl = [];
const div = document.querySelector(".url-acortadas");

burguer.addEventListener("click",()=>{
    let  navMobile = document.querySelector('#invisible');
    navMobile.classList.toggle("invisible");
});
//eliminar contenedor
const eliminarUrl= (e)=>{
    e.preventDefault();
    let  urlEliminar = e.target;
    if(urlEliminar.classList.contains("icon-bin")){
        let eliminar = urlEliminar.previousElementSibling.firstElementChild.firstElementChild.textContent;
        let contains =e.target.parentElement;
        contains.remove();
        const newListUrl = listaUrl.filter((element)=>{
            return element.oldUrl!==eliminar;
        })
        listaUrl = newListUrl;
        sincronizarLocalStorage();
    }
    
}

//agregar card
const crearCard = (datos) =>{
    
    const card = document.createElement("div");
    card.classList.add("card");
    

    const oldUrlElement = document.createElement("p");
    const oldLink = document.createElement("a");
    oldLink.setAttribute("href",`${datos.oldUrl}`);
    oldLink.setAttribute("target","_blank");
    oldLink.textContent = datos["oldUrl"]
    oldUrlElement.classList.add("old-url");
    oldUrlElement.textContent = 'URL Original: ';
    oldUrlElement.appendChild(oldLink);

    const newUrlElement = document.createElement('p');
    const newLink = document.createElement("a");
    newLink.setAttribute("href",`${datos.newUrl}`);
    newLink.setAttribute("target","_blank");
    newLink.textContent = datos["newUrl"]
    newUrlElement.classList.add("new-url");
    newUrlElement.textContent = 'URL Acortada: ';
    newUrlElement.appendChild(newLink);

    // Generar el código QR
    const contenedorQR = document.createElement("div");
    
    const pQr = document.createElement("p");
    pQr.textContent = "Código QR: ";
    contenedorQR.classList.add("contenedor-qr");
    const codeQR = document.createElement("div");
    codeQR.style.width = "50px";
    codeQR.style.height = "50px";
    codeQR.classList.add("qrcode")

    const options = {
        width: 50, // Ancho QR
        height: 50, // Altura QR
    };
    new QRCode(codeQR, `${datos.newUrl}`, options);
    contenedorQR.appendChild(pQr);
    contenedorQR.appendChild(codeQR);

    
    card.appendChild(oldUrlElement);
    card.appendChild(newUrlElement);
    card.appendChild(contenedorQR);

    return card;
}
function sincronizarLocalStorage(){
    localStorage.setItem('urls', JSON.stringify(listaUrl));
}
const agregarHtml = () =>{
    div.innerHTML = "";
    sincronizarLocalStorage();
    
    listaUrl.forEach(element =>{
        const card = crearCard(element)
        const basura = document.createElement("a");
        basura.classList.add("icon-bin");
        basura.setAttribute("href","#");
        const contenedor = document.createElement("div");
        contenedor.classList.add("contenedor-card");
        contenedor.appendChild(card);
        contenedor.appendChild(basura);
        div.appendChild(contenedor);

        basura.addEventListener("click", eliminarUrl);
    })
}

const validarEntrada =()=>{
    let url = urlValid.value;
    const urlRegExp = /^(https?|ftp):\/\/[^\s/$.?#]+.[^\s]*$/i;
    if(urlRegExp.test(url)){
        urlValid.style.color = "green";
        urlValid.style.outlineColor = "green";
        boton.removeAttribute("disabled");
        
    }else{
        boton.setAttribute("disabled","true");
        urlValid.style.color = "red";
        urlValid.style.outlineColor = "red";
        urlValid.style.borderColor = "red";
        
    }
}

const capturarUrl = ((e)=>{
    validarEntrada()
    e.preventDefault();
    boton.setAttribute("disabled","true");
    let url = urlValid.value
    let urlObtenida = url;
    url = "";
    urlValid.value=url;
    //peticion api
        const accessToken = '3fcdcac7bd2e2a2f5405163b60df39d03ccf6f9d'; 
        const longUrl = urlObtenida; 

        const data = {
            long_url: longUrl
        };

        // Realizar la solicitud a la API para acortar la URL
        fetch('https://api-ssl.bitly.com/v4/shorten', {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            // Manejar la respuesta de la API
            let urlAcortada = data.link
            let respuesta = listaUrl.some((e)=>{
                return urlObtenida == e["oldUrl"];
            })
            if(!respuesta){
                listaUrl.push({"oldUrl": urlObtenida, "newUrl": urlAcortada});
                agregarHtml();
            }else{
                alert("La Url ya ha sido ingresada anteriormente!")
            }
            
        })
        .catch(error => {
            // Manejar errores
            console.error('Error al acortar la URL:', error);
        });
})

urlValid.addEventListener("input",validarEntrada);
boton.addEventListener("click", capturarUrl);
document.addEventListener("DOMContentLoaded", () => {
    listaUrl = JSON.parse(localStorage.getItem('urls'))
    agregarHtml();
})


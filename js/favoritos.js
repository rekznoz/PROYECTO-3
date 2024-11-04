import { webInitonLoad, obtenerElementos, eliminarElemento } from './api.js'

function onLoadWindows(){
    let conexion = webInitonLoad()
    conexion.addEventListener('success', mostrarFavoritos)
}
window.addEventListener('load', onLoadWindows)

let favoritos = []
let contadorNotifacion

const listaFavoritos = document.querySelector('#resultado')
const modal = document.querySelector('#modal')
const modalBody = document.querySelector('#modal .modal-content')
const buscador = document.querySelector('#buscador')
const notifa = document.querySelector('#toast')

function limpiarHTML(padre){
    while(padre.firstChild){
        padre.removeChild(padre.firstChild)
    }
}

function notificacion(mensaje){

    const boton = notifa.querySelector('.btn-close')
    const body = notifa.querySelector('.toast-body')

    notifa.classList.add('show')

    boton.addEventListener('click', () => {
        notifa.classList.remove('show')
    })

    if (contadorNotifacion){
        clearTimeout(contadorNotifacion)
    }

    contadorNotifacion = setTimeout(() => {
        notifa.classList.remove('show')
    }, 3000)

    body.textContent = mensaje

}

function mostrarFavoritos(){
    let conexion = obtenerElementos()
    conexion.addEventListener('success', () => {
        let cursor = conexion.result
        if(cursor){
            mostrarFavorito(cursor.value)
            favoritos.push(cursor.value)
            cursor.continue()
        }

    })
}

function buscarEnFavoritos(evento){
    evento.preventDefault()
    limpiarHTML(listaFavoritos)
    const texto = evento.target.value.toLowerCase()
    favoritos.forEach(favorito => {
        const {nombre} = favorito
        if(nombre.toLowerCase().indexOf(texto) !== -1){
            mostrarFavorito(favorito)
        }
    })
    if(listaFavoritos.children.length === 0){
        const div = document.createElement('div')
        div.classList.add('col-md-12')
        div.textContent = 'No se encontraron resultados'
        listaFavoritos.appendChild(div)
    }

}
buscador.addEventListener('input', buscarEnFavoritos)

function mostrarFavorito(favorito){

    const {id, nombre, imagen, categoria} = favorito

    const div = document.createElement('div')
    div.classList.add('col-md-4', 'mb-4')

    const divCard = document.createElement('div')
    divCard.classList.add('card')
    div.appendChild(divCard)

    const img = document.createElement('img')
    img.src = imagen
    img.classList.add('card-img-top')
    divCard.appendChild(img)

    const divCardBody = document.createElement('div')
    divCardBody.classList.add('card-body', 'text-center', 'd-flex', 'flex-column', 'justify-content-between')
    divCard.appendChild(divCardBody)

    const h5 = document.createElement('h5')
    h5.textContent = nombre
    h5.classList.add('card-title')
    divCardBody.appendChild(h5)

    const p = document.createElement('p')
    p.textContent = categoria
    p.classList.add('card-text')
    divCardBody.appendChild(p)

    const botonVer = document.createElement('a')
    botonVer.classList.add('btn', 'btn-primary', 'col', 'mb-2')
    botonVer.textContent = 'Ver Receta'
    divCardBody.appendChild(botonVer)

    const botonEliminar = document.createElement('a')
    botonEliminar.classList.add('btn', 'btn-danger', 'col', 'mb-2')
    botonEliminar.textContent = 'Eliminar'
    divCardBody.appendChild(botonEliminar)

    listaFavoritos.appendChild(div)

    botonVer.onclick = () => {
        mostrarModal(favorito)
    }

    botonEliminar.onclick = () => {
        let conexion = eliminarElemento(id)
        conexion.addEventListener('success', () => {
            listaFavoritos.removeChild(div)
            const index = favoritos.indexOf(favorito)
            favoritos.splice(index, 1)
            notificacion('Receta eliminada de favoritos')
        })
    }

}

function mostrarModal(datos){

    limpiarHTML(modalBody)

    // Limpio el Modal y lo reconstruyo

    const header = document.createElement('div')
    header.classList.add('modal-header')

    const h1 = document.createElement('h1')
    h1.classList.add('modal-title', 'fs-3', 'font-bold')
    h1.id = 'staticBackdropLabel'

    const button = document.createElement('button')
    button.type = 'button'
    button.classList.add('btn-close')
    button.dataset.bsDismiss = 'modal'
    button.ariaLabel = 'Close'

    header.appendChild(h1)
    header.appendChild(button)

    const cuerpo = document.createElement('div')
    cuerpo.classList.add('modal-body')

    const footer = document.createElement('div')
    footer.classList.add('modal-footer', 'flex', 'justify-content-between')

    modalBody.appendChild(header)
    modalBody.appendChild(cuerpo)
    modalBody.appendChild(footer)

    modal.classList.add('show')
    modal.style.display = 'block'

    const {id, nombre, imagen, instrucciones, video, ingredientes, medidas} = datos

    h1.textContent = nombre

    // Imagen

    const img = document.createElement('img')
    img.src = imagen
    img.alt = nombre
    img.classList.add('img-fluid', 'rounded', 'mx-auto', 'd-block', 'my-3')
    cuerpo.appendChild(img)

    const p = document.createElement('p')
    p.textContent = instrucciones

    const h3 = document.createElement('h3')
    h3.textContent = 'Ingredientes'
    h3.classList.add('my-3', 'text-center')

    const ul = document.createElement('ul')
    ul.classList.add('list-group')

    ingredientes.forEach((ingrediente, index) => {
        const li = document.createElement('li')
        li.classList.add('list-group-item')
        li.textContent = `${ingrediente} - ${medidas[index]}`
        ul.appendChild(li)
    })

    // Video Receta

    const h3Video = document.createElement('h3')
    h3Video.textContent = 'Video Receta'
    h3Video.classList.add('my-3', 'text-center')

    const a = document.createElement('a')
    a.href = video
    a.target = '_blank'
    a.classList.add('btn', 'btn-primary', 'd-block', 'mx-auto', 'my-3')
    a.textContent = 'Ver video'

    cuerpo.appendChild(p)
    cuerpo.appendChild(h3)
    cuerpo.appendChild(ul)
    cuerpo.appendChild(h3Video)
    cuerpo.appendChild(a)

    button.addEventListener('click', () => {
        modal.style.display = 'none'
    })

    window.addEventListener('click', (evento) => {
        if(evento.target === modal){
            modal.style.display = 'none'
        }
    })

    const buttonCerrar = document.createElement('button')
    buttonCerrar.classList.add('btn', 'btn-secondary', 'col')
    buttonCerrar.textContent = 'Cerrar'
    buttonCerrar.addEventListener('click', () => {
        modal.style.display = 'none'
    })

    footer.appendChild(buttonCerrar)

}


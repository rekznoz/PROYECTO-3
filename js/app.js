
import { webInitonLoad, agregarElemento, obtenerElementos, eliminarElemento } from './api.js'

// https://www.themealdb.com/api.php

// Categorias
// www.themealdb.com/api/json/v1/1/categories.php

// Filtrar categorias
// www.themealdb.com/api/json/v1/1/filter.php?c=Seafood

// Receta por ID
// www.themealdb.com/api/json/v1/1/lookup.php?i=52772

// Buscar receta
// www.themealdb.com/api/json/v1/1/search.php?s=Arrabiata

function onLoadWindows(){
    let conexion = webInitonLoad()
    conexion.addEventListener('success', cargarFavoritos)
}
window.addEventListener('load', onLoadWindows)

function limpiarHTML(padre){
    while(padre.firstChild){
        padre.removeChild(padre.firstChild)
    }
}

let favoritos = []
function cargarFavoritos(){
    let conexion = obtenerElementos()
    conexion.addEventListener('success', () => {
        let cursor = conexion.result
        if(cursor){
            favoritos.push(cursor.value)
            cursor.continue()
        }
    })
    console.log(favoritos)
}

const categorias = document.querySelector('#categorias')
const cuerpoRecetas = document.querySelector('#resultado')
const modal = document.querySelector('#modal')
const modalBody = document.querySelector('#modal .modal-content')
const botonAleatorio = document.querySelector('#recetaAleatoria')

function cargarCategorias (){
    const url = 'https://www.themealdb.com/api/json/v1/1/categories.php'

    fetch(url)
        .then(respuesta => respuesta.json())
        .then(datos => {
            const {categories} = datos
            categories.forEach(categoria => {
                const {strCategory} = categoria
                const option = document.createElement('option')
                option.textContent = strCategory
                option.value = strCategory
                categorias.appendChild(option)
            })
            //console.log(datos)
        })
        .catch(error => {
            console.log(error)
        })
}
window.addEventListener('load', cargarCategorias)

function filtrarPorCategoria(evento){
    evento.preventDefault()
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categorias.value}`
    limpiarHTML(cuerpoRecetas)
    fetch(url)
        .then(respuesta => respuesta.json())
        .then(datos => {
            if (datos.meals === null) {
                botonAleatorio.textContent = 'Receta Aleatoria'
            } else {
                mostrarRecetas(datos)
                // SI HAY DATOS EL BOTON DE ALEATORIO SE MODIFICA
                botonAleatorio.textContent = 'Receta Aleatoria de ' + categorias.value
            }
        })
        .catch(error => {
            console.log(error)
        })
}
categorias.addEventListener('change', filtrarPorCategoria)

function obtenerRecetaAleatoria(){
    if (categorias.value === '-- Seleccione --'){
        const url = 'https://www.themealdb.com/api/json/v1/1/random.php'
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(datos => {
                mostrarModal(datos)
            })
            .catch(error => {
                console.log(error)
            })
    } else {
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categorias.value}`
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(datos => {
                const {meals} = datos
                const aleatorio = Math.floor(Math.random() * meals.length)
                const id = meals[aleatorio].idMeal
                const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
                fetch(url)
                    .then(respuesta => respuesta.json())
                    .then(datos => {
                        mostrarModal(datos)
                    })
                    .catch(error => {
                        console.log(error)
                    })
            })
            .catch(error => {
                console.log(error)
            })
    }

}
botonAleatorio.addEventListener('click', obtenerRecetaAleatoria)

function mostrarRecetas(datos){

    const {meals} = datos
    meals.forEach(receta => {
        const {strMeal, strMealThumb, idMeal} = receta
        const div = document.createElement('div')
        div.classList.add('col-md-4', 'col-sm-6', 'col-12')

        const divCard = document.createElement('div')
        divCard.classList.add('card', 'mb-4', 'shadow-sm', 'rounded')
        div.appendChild(divCard)

        const img = document.createElement('img')
        img.src = strMealThumb
        img.alt = strMeal
        img.classList.add('card-img-top', 'img-fluid', 'rounded', 'mx-auto', 'd-block')
        divCard.appendChild(img)

        const divCardBody = document.createElement('div')
        divCardBody.classList.add('card-body')
        divCard.appendChild(divCardBody)

        const h2 = document.createElement('h2')
        h2.textContent = strMeal
        h2.classList.add('card-title', 'text-center', 'my-3')
        divCardBody.appendChild(h2)

        const a = document.createElement('a')
        a.href = '#'
        a.classList.add('btn', 'btn-primary', 'd-block', 'mx-auto', 'my-3', 'botonVer')
        a.dataset.toggle = 'modal'
        a.dataset.target = '#receta'
        a.dataset.id = idMeal
        a.textContent = 'Ver receta'
        divCardBody.appendChild(a)

        cuerpoRecetas.appendChild(div)
    })
}

function mostrarReceta(evento){
    evento.preventDefault()
    if(evento.target.classList.contains('botonVer')){
        console.log('Ver receta')
        const id = evento.target.dataset.id
        console.log(id)
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        fetch(url)
            .then(respuesta => respuesta.json())
            .then(receta => {
                mostrarModal(receta)
                console.log(receta)
            })
            .catch(error => {
                console.log(error)
            })
    }
}
cuerpoRecetas.addEventListener('click', mostrarReceta)

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

    const {meals} = datos

    const {idMeal, strMeal, strMealThumb, strInstructions, strYoutube} = meals[0]

    const ingredientes = []
    for(let i = 1; i <= 20; i++){
        if(meals[0][`strIngredient${i}`]){
            ingredientes.push(meals[0][`strIngredient${i}`])
        }
    }

    const medidas = []
    for(let i = 1; i <= 20; i++){
        if(meals[0][`strMeasure${i}`]){
            medidas.push(meals[0][`strMeasure${i}`])
        }
    }

    h1.textContent = strMeal

    // Imagen

    const img = document.createElement('img')
    img.src = strMealThumb
    img.alt = strMeal
    img.classList.add('img-fluid', 'rounded', 'mx-auto', 'd-block', 'my-3')
    cuerpo.appendChild(img)

    const p = document.createElement('p')
    p.textContent = strInstructions

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
    a.href = strYoutube
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

    // Boton cerrar y AgregarFavoritos en Footer

    const buttonCerrar = document.createElement('button')
    buttonCerrar.classList.add('btn', 'btn-secondary', 'col')
    buttonCerrar.textContent = 'Cerrar'
    buttonCerrar.addEventListener('click', () => {
        modal.style.display = 'none'
    })
    footer.appendChild(buttonCerrar)

    // Boton dinamico de Favoritos / Borrar

    const botonDinamico = document.createElement('button')
    botonDinamico.classList.add('btn', 'col')

    if (favoritos.some(favorito => favorito.id === idMeal)){
        botonDinamico.textContent = 'Borrar de Favoritos'
        botonDinamico.classList.add('btn-danger')
    } else {
        botonDinamico.textContent = 'Agregar a Favoritos'
        botonDinamico.classList.add('btn-success')
    }

    botonDinamico.addEventListener('click', () => {
        if (favoritos.some(favorito => favorito.id === idMeal)){
            eliminarElemento(idMeal)
            botonDinamico.textContent = 'Agregar a Favoritos'
            botonDinamico.classList.remove('btn-danger')
            botonDinamico.classList.add('btn-success')
            favoritos = favoritos.filter(favorito => favorito.id !== idMeal)
        } else {
            agregarFavoritos(meals[0], ingredientes, medidas)
            botonDinamico.textContent = 'Borrar de Favoritos'
            botonDinamico.classList.remove('btn-success')
            botonDinamico.classList.add('btn-danger')
        }
    })

    footer.appendChild(botonDinamico)

}

function agregarFavoritos(receta, ingredientes, medidas){
    const {idMeal, strMeal, strMealThumb, strInstructions, strYoutube} = receta
    const objetoReceta = {
        id: idMeal,
        nombre: strMeal,
        imagen: strMealThumb,
        instrucciones: strInstructions,
        video: strYoutube,
        ingredientes: ingredientes,
        medidas: medidas
    }
    agregarElemento(objetoReceta)
    favoritos.push(objetoReceta)
}
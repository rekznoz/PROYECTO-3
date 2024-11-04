
export let baseDatosGlobal

let nombredb = 'DB-Recetas'
let nombrealmacen = 'recetas'

export function webInitonLoad(){

    // Abre la base de datos
    let solicitud = indexedDB.open(nombredb, 1)

    // Eventos de la base de datos
    solicitud.addEventListener('error', mostrarError)
    solicitud.addEventListener('success', iniciarBaseDatos)
    solicitud.addEventListener('upgradeneeded', crearAlmacen)
    return solicitud
}
//window.addEventListener('load', webInitonLoad)

// Mustra un mensaje de error en la consola si la base de datos no se puede abrir
function mostrarError(evento){
    console.log('Error: ', evento)
}

// Inicia la base de datos si se puede abrir
function iniciarBaseDatos(evento){
    baseDatosGlobal = evento.target.result
    console.log('Base de datos iniciada')
}

// Crea un almacen en la base de datos si no existe
function crearAlmacen(evento){
    const basedatos = evento.target.result
    const almacen = basedatos.createObjectStore(nombrealmacen, {keyPath: 'id', autoIncrement: false})
    console.log('Almacen creado')
}

export function agregarElemento(elemento){
    let transaction = baseDatosGlobal.transaction([nombrealmacen], 'readwrite')
    let almacen = transaction.objectStore(nombrealmacen)
    let agregar = almacen.add(elemento)

    agregar.onerror = (evento) => {
        if (evento.target.error.name === 'ConstraintError') {
            alert('El email ya existe')
        } else {
            alert('No se pudo agregar el Elemento')
        }
    }
}

export function eliminarElemento(id){
    let transaction = baseDatosGlobal.transaction([nombrealmacen], 'readwrite')
    let almacen = transaction.objectStore(nombrealmacen)
    let eliminar = almacen.delete(id)

    eliminar.onerror = (evento) => {
        alert('No se pudo eliminar el Elemento')
    }
    return eliminar
}

export function obtenerElemento(id){
    let transaction = baseDatosGlobal.transaction([nombrealmacen], 'readonly')
    let almacen = transaction.objectStore(nombrealmacen)
    let elemento = almacen.get(id)

    elemento.onerror = (evento) => {
        alert('No se pudo obtener el Elemento')
    }
    return elemento
}

export function actualizarElemento(id, elemento){
    let transaction = baseDatosGlobal.transaction([nombrealmacen], 'readwrite')
    let almacen = transaction.objectStore(nombrealmacen)
    let obtener = almacen.get(id)
    obtener.onsuccess = (evento) => {
        almacen.put(elemento)
    }
}

export function obtenerElementos(){
    let transaction = baseDatosGlobal.transaction([nombrealmacen], 'readonly')
    let almacen = transaction.objectStore(nombrealmacen)
    return almacen.openCursor()
}

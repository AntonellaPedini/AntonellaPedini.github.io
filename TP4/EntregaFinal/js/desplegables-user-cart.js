//Menús desplegables del carrito y del usuario
const dropdowns = document.querySelectorAll('.panel-izquierdo'); //Busca todos los elementos con la clase: carrito + su panel, usuario + su panel. Lista de estos dos "envoltorios"

function cerrarDropdowns() {
    dropdowns.forEach(wrap => {
        wrap.querySelector('.panel-desplegable').classList.remove('abierto');
        wrap.querySelector('.icono-btn').setAttribute('aria-expanded', 'false'); //Accesibilidad
    });
}

dropdowns.forEach(wrap => {
    const boton = wrap.querySelector('.icono-btn');
    const panel = wrap.querySelector('.panel-desplegable');

    boton.addEventListener('click', () => {
        const estabaAbierto = panel.classList.contains('abierto');
        cerrarDropdowns();                    // cierra el otro (uno solo a la vez)
        if (!estabaAbierto) {
            panel.classList.add('abierto');
            boton.setAttribute('aria-expanded', 'true');
        }
    });
});

document.addEventListener('click', e => {
    if (!e.target.closest('.panel-izquierdo')) cerrarDropdowns();   // Si cliqueo por fuera, el panel se cierra, sino no hace nada
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') cerrarDropdowns();
});
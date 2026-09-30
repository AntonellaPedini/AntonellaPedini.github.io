/*Menu hamburguesa toggle*/ 
const botonHamburguesa = document.querySelector('.menu-hamburguesa');
const menuDesplegable = document.querySelector('.menu-desplegable');


botonHamburguesa.addEventListener('click', () => 
    menuDesplegable.classList.toggle('abierto'));

const titulos = document.querySelectorAll('.footer-columna h4');

titulos.forEach(titulo => {
    titulo.addEventListener('click', () => {
        titulo.parentElement.classList.toggle('abierta');
    });
});
document.querySelectorAll('.carrusel-container').forEach(container => { //Busca todos los elementos con la clase, y devuelve una lista que recorre. En cada vuelta, container es el carrusel actual

    //Busca los elementos dentro de cada container/carrusel
    const track = container.querySelector('.carrusel-track');
    const flechaIzq = container.querySelector('.nav-btn-prev');
    const flechaDer = container.querySelector('.nav-btn-next');

    if (track && flechaIzq && flechaDer) {
        const distanciaScroll = () => { //Calcula cuántos px equivale mover una card
            const card = track.querySelector('.juego-card'); //Agarra la 1ra card del carrusel
            const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            return card.getBoundingClientRect().width + gap; //El ancho real de la card en px, como se ve en pantalla + el espacio entre cards. Es lo que hay que avanzar para que aparezca la siguiente
        };

        flechaDer.addEventListener('click', () => { //scrollBy para que desplace el scroll relativo a la posición actual en lugar de una posición absoluta
            track.scrollBy({ left: distanciaScroll(), behavior: 'smooth' });
        });

        flechaIzq.addEventListener('click', () => {
            track.scrollBy({ left: -distanciaScroll(), behavior: 'smooth' });
        });
    }
});
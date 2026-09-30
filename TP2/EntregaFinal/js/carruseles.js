document.querySelectorAll('.carrusel-container').forEach(container => {
    const track = container.querySelector('.carrusel-track');
    const flechaIzq = container.querySelector('.nav-btn-prev');
    const flechaDer = container.querySelector('.nav-btn-next');

    if (track && flechaIzq && flechaDer) {
        const distanciaScroll = () => {
            const card = track.querySelector('.juego-card');
            const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            return card.getBoundingClientRect().width + gap;
        };

        flechaDer.addEventListener('click', () => {
            track.scrollBy({ left: distanciaScroll(), behavior: 'smooth' });
        });

        flechaIzq.addEventListener('click', () => {
            track.scrollBy({ left: -distanciaScroll(), behavior: 'smooth' });
        });
    }
});
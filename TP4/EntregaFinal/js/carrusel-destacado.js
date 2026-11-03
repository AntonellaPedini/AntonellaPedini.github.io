const SLIDES = [ //Array de objetos, un objeto por imagen
    { src: "img/Miniaturas_cards/aladdin2.jpg", alt: "Aladdin (USA)" },
    { src: "img/Miniaturas_cards/aladdin1.gif", alt: "Aladdin (USA)" },
    { src: "img/Miniaturas_cards/aladdin3.jpg", alt: "Aladdin (USA)" },
    { src: "img/Miniaturas_cards/aladdin4.jpg", alt: "Aladdin (USA)" },
    { src: "img/Miniaturas_cards/aladdin5.jpg", alt: "Aladdin (USA)" },
    { src: "img/Miniaturas_cards/aladdin6.png", alt: "Aladdin (USA)" },
];

const EASE_SETTLE = "transform 600ms cubic-bezier(0.22, 0.61, 0.36, 1)"; //Constantes con valores
const EASE_DRAG = "transform 140ms ease-out"; //de transición css. Propiedad/duración/curva de aceleración personalizada con cubic-bezier (arranca rápido y frena suave)

const track = document.getElementById("track");
const dotsContainer = document.getElementById("dots");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");

// Estado, las variables definen cómo está el carrusel en este momento
let index = 1; //Arranca en la segunda imagen (el gif)
let skew = 0; //Cuántos grados está inclinada, acá recta
let transition = EASE_SETTLE; //Cuál de las dos transiciones está usando ahora
let animating = false; //Vale true mientras hay una animación activa para ignorar clicks apurados

// Crear las imágenes
SLIDES.forEach((slide, i) => { //Recorre el array, en cada vuelta slide es el objeto actual (src, alt)
    const img = document.createElement("img"); //Crea un <img> y le asigna src y alt
    img.src = slide.src;
    img.alt = slide.alt;
    img.loading = "lazy"; //El navegador carga la imagen solo cuando está por verse
    img.draggable = false;
    img.classList.add("carousel__slide"); //Agrega una clase css
    if (i === index) img.classList.add("is-active");//A la imagen que está "activa"/en el centro, le agrega la clase
    track.appendChild(img); //La mete dentro de track, hasta acá solo existía en memoria

    const dot = document.createElement("button");
    dot.type = "button";
    dot.classList.add("carousel__dot");
    dot.setAttribute("aria-label", "Ir a la imagen " + (i + 1));
    if (i === index) dot.classList.add("is-active");
    dot.addEventListener("click", () => { //Al hacer click en un puntito, se mueve el carrusel. goTo recibe cuántos pasos moverse, y i-index lo calcula
        if (i > index) goTo(i - index);
        else if (i < index) goTo(i - index);
    });
    dotsContainer.appendChild(dot);
});

const dots = Array.from(dotsContainer.children); //Lista de todos los puntitos
const slideEls = Array.from(track.children); //Lista de todas las imágenes

// Renderizar según el estado
function render() {
    const slideW = slideEls[0].offsetWidth; //Ancho en px de la 1ra imagen
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const viewW = track.parentElement.clientWidth; //Ancho de la ventana visible, que es el contenedor padre en este caso

    const offset = viewW / 2 - slideW / 2 - index * (slideW + gap); //Calcula cuántos px mover la tira para que la imagen activa quede centrada
    track.style.transition = transition; //Aplica al elementos los estilos calculados
    track.style.transform =
        "translateX(" + offset + "px) skewX(" + skew + "deg)";

    //Agrega la clase si la condición es true y la saca si es false. Recorre todas las img y los puntitos y solo el index actual queda con is-active
    slideEls.forEach((el, i) => {
        el.classList.toggle("is-active", i === index);
    });

    dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === index);
    });

    //Desactiva las flechas en los extremos
    btnPrev.disabled = index === 0;
    btnNext.disabled = index === SLIDES.length - 1;
}

// Movimiento con efecto de arrastre
function goTo(steps) {
    const next = index + steps;
    if (animating || next < 0 || next >= SLIDES.length) return;
    animating = true;
    const dir = steps > 0 ? 1 : -1;

    // Fase 1: la tira se inclina (skew) como si se arrastrara.
    skew = dir * -7 * Math.abs(steps); //Calcula los grados de inclinación, 7 por cada paso, con signo según la dirección. Hacia adelante negativo, hacia atrás positivo
    transition = EASE_DRAG; //Cambia la transición a la rápida
    render();

    // Fase 2: se desplaza hacia la imagen destino y vuelve a quedar recta.
    setTimeout(() => { //Ejecuta la función después de la espera de 150 ms
        index = next; //Actualiza index al destino
        skew = 0; //Endereza la card
        transition = EASE_SETTLE; //Cambia la transición lenta
        render(); //Mueve la tira y la endereza a la vez en 600 ms
        setTimeout(() => {
            animating = false; //Suelta la "traba" para permitir otro movimiento
        }, 620);
    }, 150);
}

btnPrev.addEventListener("click", () => goTo(-1)); //Flecha izquierda mueve una card hacia trás
btnNext.addEventListener("click", () => goTo(1)); //Derecha mueve una hacia adelante

// Navegación con teclado
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") goTo(-1);
    if (event.key === "ArrowRight") goTo(1);
});

// Posición inicial
render(); //Se ejecuta una vez al cargar para dejar el carrusel en su posición original
window.addEventListener("resize", render); //Para que la slide actual quede centrada sin necesitar recargar cuando se cambia el tamaño de la ventana
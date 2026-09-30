const SLIDES = [
    { src: "img/Miniaturas_cards/aladdin1.gif", alt: "Aladdin (USA)" },
    { src: "img/Miniaturas_cards/aladdin2.jpg", alt: "Aladdin (USA)" },
    { src: "img/Miniaturas_cards/aladdin3.jpg", alt: "Aladdin (USA)" },
    { src: "img/Miniaturas_cards/aladdin4.jpg", alt: "Aladdin (USA)" },
    { src: "img/Miniaturas_cards/aladdin5.jpg", alt: "Aladdin (USA)" },
    { src: "img/Miniaturas_cards/aladdin6.png", alt: "Aladdin (USA)" },
];

const EASE_SETTLE = "transform 600ms cubic-bezier(0.22, 0.61, 0.36, 1)";
const EASE_DRAG = "transform 140ms ease-out";

// ============= Referencias al DOM =============
const track = document.getElementById("track");
const dotsContainer = document.getElementById("dots");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");

// ============= Estado =============
let index = 1;
let skew = 0;
let transition = EASE_SETTLE;
let animating = false;

// ============= Crear las imágenes =============
SLIDES.forEach((slide, i) => {
    const img = document.createElement("img");
    img.src = slide.src;
    img.alt = slide.alt;
    img.loading = "lazy";
    img.draggable = false;
    img.classList.add("carousel__slide");
    if (i === index) img.classList.add("is-active");
    track.appendChild(img);

    const dot = document.createElement("button");
    dot.type = "button";
    dot.classList.add("carousel__dot");
    dot.setAttribute("aria-label", "Ir a la imagen " + (i + 1));
    if (i === index) dot.classList.add("is-active");
    dot.addEventListener("click", () => {
        if (i > index) goTo(i - index);
        else if (i < index) goTo(i - index);
    });
    dotsContainer.appendChild(dot);
});

const dots = Array.from(dotsContainer.children);
const slideEls = Array.from(track.children);

// ============= Render =============
function render() {
    const slideW = slideEls[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const viewW = track.parentElement.clientWidth;

    const offset = viewW / 2 - slideW / 2 - index * (slideW + gap);
    track.style.transition = transition;
    track.style.transform =
        "translateX(" + offset + "px) skewX(" + skew + "deg)";

    slideEls.forEach((el, i) => {
        el.classList.toggle("is-active", i === index);
    });

    dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === index);
    });

    btnPrev.disabled = index === 0;
    btnNext.disabled = index === SLIDES.length - 1;
}

// ============= Movimiento con efecto de arrastre =============
function goTo(steps) {
    const next = index + steps;
    if (animating || next < 0 || next >= SLIDES.length) return;
    animating = true;
    const dir = steps > 0 ? 1 : -1;

    // Fase 1: la tira se inclina (skew) como si se arrastrara.
    skew = dir * -7 * Math.abs(steps);
    transition = EASE_DRAG;
    render();

    // Fase 2: se desplaza hacia la imagen destino y vuelve a quedar recta.
    setTimeout(() => {
        index = next;
        skew = 0;
        transition = EASE_SETTLE;
        render();
        setTimeout(() => {
            animating = false;
        }, 620);
    }, 150);
}

btnPrev.addEventListener("click", () => goTo(-1));
btnNext.addEventListener("click", () => goTo(1));

// Navegación con teclado
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") goTo(-1);
    if (event.key === "ArrowRight") goTo(1);
});

// Posición inicial
render();
window.addEventListener("resize", render); /*Para que la slide actual quede centrada sin necesitar recargar*/
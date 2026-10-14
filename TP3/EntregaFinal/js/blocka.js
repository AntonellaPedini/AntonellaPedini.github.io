//========Variables globales========//
const canvas = document.getElementById("blocka-canvas");
const ctx = canvas.getContext("2d");
const HUD_ALTO = 100;      // franja superior reservada
const MARGEN = 70;         // aire alrededor del tablero

const pantallaJuego = document.getElementById("pantalla-juego");
const capaInicio = document.getElementById("capa-inicio");
const imagenPortada = document.querySelector(".imagen-juego-pantalla");
const FUENTE_TITULO = '"Bitcount Ink", monospace';
const FUENTE_TEXTO = '"Chakra Petch", monospace';

let FILAS = 2;
let COLUMNAS = 2;
let tamPieza = 0;
let anchoTab = 0;
let altoTab = 0;
let dx = 0;
let dy = 0;

const ANCHO_COLUMNA = 240;   // ancho de los botones laterales
const SEPARACION = 60;       // aire entre tablero y botones

const IMAGENES = [
    "img/Blocka_imagenes/img1.jpeg",
    "img/Blocka_imagenes/img2.jpeg",
    "img/Blocka_imagenes/img3.jpeg",
    "img/Blocka_imagenes/img4.jpeg",
    "img/Blocka_imagenes/img5.jpeg",
    "img/Blocka_imagenes/img6.jpeg",
    "img/Blocka_imagenes/img7.jpeg",
    "img/Blocka_imagenes/img8.jpg",
    "img/Blocka_imagenes/img9.jpg",
    "img/Blocka_imagenes/img10.jpg",
    "img/Blocka_imagenes/img11.jpg",
    "img/Blocka_imagenes/img12.jpg"
];

const GRADOS = [0, 90, 180, 270]; //Ángulos posibles de rotación de las piezas
let estado = "cargando"; // "cargando", "menu", "jugando", "victoria", "derrota", "sorteo"
let imagenesCargadas = [];
let cargadas = 0;
let mensajeError = null;
let imagenActual = null;
const auxiliar = document.createElement("canvas");
const auxCtx = auxiliar.getContext("2d");

const FILTROS = {
    grises: aplicarFiltroGrises,
    brillo: aplicarFiltroBrillo,
    negativo: aplicarFiltroNegativo
};

const NIVELES = [
    { filtros: ["grises"] },
    { filtros: ["brillo"] },
    { filtros: ["negativo"] },
    { porPieza: "aleatorio", tiempoMax: 90000 }, //90 segundos
    { porPieza: "aleatorio" , tiempoMax: 60000} //60 segundos
];

let nivelActual = 0;

const botonComenzar = {
    x: (canvas.width  -240) / 2, y:510,
    ancho: 240, alto: 70,
    texto: "Comenzar"
}

const botonMenu = {
    x: 0, y: 400,
    ancho: 240, alto: 70,
    texto: "Menú principal"
};

const botonSiguiente = {
    x: 0, y: 300,
    ancho: 240, alto: 70,
    texto: "Siguiente nivel"
};

const COLORES = {
    fondoCentro: "#3a2478",
    fondoBorde: "#140a2e",
    marco: "#8a6cff",
    resplandor: "rgba(138, 108, 255, 0.6)",
    boton: "#be21ee",
    botonRelieve: "#69FCF7",
    botonTexto: "#020817",
    texto: "#F3ECFF",
    alerta: "#FF4F0F",
    destacado: "#fff200"
};

//Variables para el cronómetro
let inicioNivel = 0;      // instante en que empezó el nivel
let penalizacion = 0;     // ms extra (la Ayudita suma acá)
let tiempoFinal = 0;      // tiempo congelado al ganar
const records = {};       // mejor tiempo de cada nivel, por índice

//Variables para los extras
const botonReintentar = {
    x: 0, y: 500,
    ancho: 240, alto: 70,
    texto: "Reintentar"
};

let nuevoRecord = false;

const botonAyudita = {
    x: 0, y: 300,
    ancho: 240, alto: 70,
    texto: "Ayudita (+5 s)"
};

const OPCIONES_PIEZAS = [
    { texto: "4", filas: 2, columnas: 2 },
    { texto: "6", filas: 2, columnas: 3 },
    { texto: "8", filas: 2, columnas: 4 }
];

let indiceElegido = 0;
let indiceResaltado = 0;
let inicioSorteo = 0;
let tiemposPasos = [];
const PAUSA_FINAL = 1000;   // ms que se queda mostrando la elegida antes de empezar

//========Funciones========//
OPCIONES_PIEZAS.forEach((op, i) => {
    op.ancho = 140;
    op.alto = 60;
    op.x = (canvas.width - 460) / 2 + i * 160;   // 3 botones de 140 con 20 de separación, centrados
    op.y = 430;
});

function precargar(rutas) {
    return Promise.all(rutas.map(function (ruta) { //Espera a que todas terminen de cargarse, y devuelve un array con todas las imágenes cargadas
        return new Promise(function (resolve, reject) {
            const img = new Image();
            img.onload = function () {
                cargadas++;
                redibujar();        // actualiza el contador en pantalla
                resolve(img);
            };
            img.onerror = function () { reject(ruta); };
            img.src = ruta;
        });
    }));
}

function dibujarFondo() {
    const cx = canvas.width / 2;
    const cy = canvas.height * 0.35;

    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvas.width * 0.7);
    g.addColorStop(0, COLORES.fondoCentro);
    g.addColorStop(1, COLORES.fondoBorde);

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function dibujarMarco() {
    ctx.save();
    ctx.shadowColor = COLORES.resplandor;
    ctx.shadowBlur = 30;
    ctx.fillStyle = COLORES.marco;
    ctx.beginPath();
    ctx.roundRect(dx - 12, dy - 12, anchoTab + 24, altoTab + 24, 18);
    ctx.fill();
    ctx.restore();
}

function elegirGradoAlAzar() {
    const indice = Math.floor(Math.random() * GRADOS.length);
    return GRADOS[indice];
}

function prepararAuxiliar(img) {
    auxiliar.width = anchoTab;
    auxiliar.height = altoTab;

    const proporcion = anchoTab / altoTab;
    let sw, sh;

    if (img.width / img.height > proporcion) {
        // la foto es más ancha que el tablero: se aprovecha todo el alto
        sh = img.height;
        sw = sh * proporcion;
    } else {
        // la foto es más alta: se aprovecha todo el ancho
        sw = img.width;
        sh = sw / proporcion;
    }

    const sx = (img.width - sw) / 2;
    const sy = (img.height - sh) / 2;

    auxCtx.drawImage(img, sx, sy, sw, sh, 0, 0, anchoTab, altoTab);
}

const piezas = []; //Afuera de las funciones para que sea global y se pueda acceder desde cualquier función

function crearPiezas() {
    piezas.length = 0;

    for (let fila = 0; fila < FILAS; fila++) {
        for (let col = 0; col < COLUMNAS; col++) {
            const pieza = {
                sx: col * tamPieza,
                sy: fila * tamPieza,
                sw: tamPieza,
                sh: tamPieza,
                dx: dx + col * tamPieza,
                dy: dy + fila * tamPieza,
                dw: tamPieza,
                dh: tamPieza,
                rotacion: elegirGradoAlAzar(),
                fija: false,
            };
            piezas.push(pieza);
        }
    }

    if (estaArmada()) { //Si por casualidad todas las piezas quedaron en 0 grados, rotar una al azar
        const indice = Math.floor(Math.random() * piezas.length);
        piezas[indice].rotacion = 90 * (1 + Math.floor(Math.random() * 3)); //No se selecciona desde la función para evitar que vuelva a salir 0 de vuelta
    }
}

function aplicarFiltrosDelNivel(nivel) {
    if (nivel.porPieza === "aleatorio") {
        // un filtro sorteado para cada pieza
        piezas.forEach((pieza) => {
            FILTROS[elegirFiltroAlAzar()](pieza.sx, pieza.sy, pieza.sw, pieza.sh);
        });
    } else if (nivel.filtros.length === 1) {
        // un solo filtro: todo el tablero
        FILTROS[nivel.filtros[0]](0, 0, anchoTab, altoTab);
    }
}

function dibujarImagen() {
    piezas.forEach((pieza) => {
        const centroX = pieza.dx + pieza.dw / 2;
        const centroY = pieza.dy + pieza.dh / 2;

        ctx.save(); //Para guardar el estado del canvas antes de rotar, y restaurarlo después para que no afecte a las demás piezas
        ctx.translate(centroX, centroY);
        ctx.rotate(pieza.rotacion * Math.PI / 180);
        ctx.drawImage(auxiliar,
            pieza.sx, pieza.sy, pieza.sw, pieza.sh,
            -pieza.dw / 2, -pieza.dh / 2, pieza.dw, pieza.dh);
        ctx.restore();
        if (estado !== "victoria") { //líneas divisorias de la imagen para distinguir las piezas
            ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
            ctx.lineWidth = 2;
            ctx.strokeRect(pieza.dx, pieza.dy, pieza.dw, pieza.dh);
        }

        if (pieza.fija) {
            ctx.strokeStyle = COLORES.destacado;
            ctx.lineWidth = 8;
            ctx.strokeRect(pieza.dx, pieza.dy, pieza.dw, pieza.dh);
        }
    });
}

function dibujarMensajeVictoria() {
    const cx = botonSiguiente.x + botonSiguiente.ancho / 2;   // centro de la columna de botones

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = COLORES.texto;
    ctx.font = "700 32px " + FUENTE_TEXTO;
    ctx.fillText(hayNivelSiguiente() ? "¡Nivel completado!" : "¡Juego completado!", cx, 170, 300);

    ctx.font = "700 26px " + FUENTE_TEXTO;
    ctx.fillText("Tu tiempo: " + formatearTiempo(tiempoFinal), cx, 215, 300);

    if (nuevoRecord) {
        ctx.fillStyle = COLORES.destacado;
        ctx.font = "700 30px " + FUENTE_TEXTO;
        ctx.fillText("¡NUEVO RÉCORD!", cx, 262, 300);
    }
}
// Convierte la posición del mouse en coordenadas relativas al canvas
//e.clientX - rect.left da el clic relativo a la esquina del canvas, en píxeles de pantalla. Multiplicar por canvas.width / rect.width lo pasa a píxeles internos, que son los que usan pieza.dx, pieza.dy, etc.
function posicionEnCanvas(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
}

function piezaEnPosicion(x, y) { //¿En qué pieza está el clic? Devuelve la pieza o undefined si no hay ninguna
    return piezas.find(pieza =>
        x >= pieza.dx && x < pieza.dx + pieza.dw &&
        y >= pieza.dy && y < pieza.dy + pieza.dh
    );
}

function comprobarVictoria() {
    if (!estaArmada()) return;

    tiempoFinal = tiempoActual();

    if (records[claveRecord()] === undefined || tiempoFinal < records[claveRecord()]) {
        nuevoRecord = true;
        records[claveRecord()] = tiempoFinal;
    }

    estado = "victoria";
    prepararAuxiliar(imagenActual);
    redibujar();
}

canvas.addEventListener("contextmenu", function (e) {
    e.preventDefault();      // evita el menú del navegador con el clic derecho
});

canvas.addEventListener("mousedown", function (e) {
    const clic = posicionEnCanvas(e);

    if (estado === "menu") {
        for (const op of OPCIONES_PIEZAS) {
            if (e.button === 0 && puntoEnRect(clic.x, clic.y, op)) { // Botón izquierdo y clic dentro del botón
                FILAS = op.filas;
                COLUMNAS = op.columnas;
                redibujar();
                return;
            }
        }
        
        if (e.button === 0 && puntoEnRect(clic.x, clic.y, botonComenzar)) { // Botón izquierdo y clic dentro del botón
            nivelActual = 0; //Así empieza desde el primer nivel cada vez que se vuelve a entrar al juego
            iniciarSorteo();
        }
        return;
    }

    if (estado === "victoria") {
        if (e.button === 0 && puntoEnRect(clic.x, clic.y, botonMenu)) { // Botón izquierdo y clic dentro del botón
            estado = "menu";
            redibujar();
        } else if (e.button === 0 && puntoEnRect(clic.x, clic.y, botonSiguiente) && hayNivelSiguiente()) { // Botón izquierdo y clic dentro del botón
            nivelActual++;
            iniciarSorteo();
        }
        return;
    }

    if (estado === "derrota") {
            if (e.button === 0 && puntoEnRect(clic.x, clic.y, botonReintentar)) {
                iniciarNivel(imagenActual);          // mismo Nivel, repite imagen
            } else if (e.button === 0 && puntoEnRect(clic.x, clic.y, botonMenu)) {
                estado = "menu";
                redibujar();
            }
            return;
        }

    if (estado !== "jugando") return; // Si no estamos jugando, no hacemos nada


    if (e.button === 0 && puntoEnRect(clic.x, clic.y, botonAyudita)) { // Botón izquierdo y clic dentro del botón, para que no se interprete también como un clic en una pieza
        usarAyudita();
        redibujar();
        comprobarVictoria(); // Por si la ayudita termina de armar la imagen
        return;
    }

    // Si no se hizo clic en un botón, entonces se intenta rotar una pieza
    const pieza = piezaEnPosicion(clic.x, clic.y);

    if (pieza && !pieza.fija) { //Si hay una pieza en la posición del clic y no está fija, se puede rotar
        if (e.button === 0) { // Botón izquierdo
            pieza.rotacion = anguloNormalizado(pieza.rotacion - 90); // Resta 90 grados y asegura que esté entre 0 y 270
        } else if (e.button === 2) { // Botón derecho
            pieza.rotacion = anguloNormalizado(pieza.rotacion + 90); // Suma 90 grados y asegura que esté entre 0 y 270
        }
        redibujar();
        comprobarVictoria();
    }
});

canvas.addEventListener("mousemove", function (e) { //cambia el cursor (de flecha a manito)
    const p = posicionEnCanvas(e);

    let sobreAlgo = botonesVisibles().some(b => puntoEnRect(p.x, p.y, b));

    if (estado === "jugando") {
        const pieza = piezaEnPosicion(p.x, p.y);
        if (pieza && !pieza.fija) sobreAlgo = true;
    }

    canvas.style.cursor = sobreAlgo ? "pointer" : "default";
});

function anguloNormalizado(grados) {
    return ((grados % 360) + 360) % 360;
}

function estaArmada() { //Every recorre todas las piezas y devuelve true si todas cumplen la condición, false si alguna no la cumple
    return piezas.every(pieza => anguloNormalizado(pieza.rotacion) === 0);
}

function aplicarFiltroNegativo(x, y, ancho, alto) {
    const datos = auxCtx.getImageData(x, y, ancho, alto);
    const px = datos.data;

    for (let i = 0; i < px.length; i += 4) {
        px[i]     = 255 - px[i];       // R
        px[i + 1] = 255 - px[i + 1];   // G
        px[i + 2] = 255 - px[i + 2];   // B
        // px[i + 3] (alfa): no se toca
    }

    auxCtx.putImageData(datos, x, y);
}

function aplicarFiltroBrillo(x, y, ancho, alto) {
    const datos = auxCtx.getImageData(x, y, ancho, alto);
    const px = datos.data;

    for (let i = 0; i < px.length; i += 4) {
        px[i]     = 1.3 * px[i];       // R
        px[i + 1] = 1.3 * px[i + 1];   // G
        px[i + 2] = 1.3 * px[i + 2];   // B
        // px[i + 3] (alfa): no se toca
    }

    auxCtx.putImageData(datos, x, y);
}

function aplicarFiltroGrises(x, y, ancho, alto) {
    const datos = auxCtx.getImageData(x, y, ancho, alto);
    const px = datos.data;

    for (let i = 0; i < px.length; i += 4) {
        const r = px[i];     // Rojo
        const g = px[i + 1]; // Verde
        const b = px[i + 2]; // Azul

        // Aplicar los coeficientes BT.601
        const luminancia = 0.299 * r + 0.587 * g + 0.114 * b;

        // Asignar el nuevo valor a los tres canales de color
        px[i] = luminancia; // R
        px[i + 1] = luminancia; // G
        px[i + 2] = luminancia; // B
        // px[i + 3] (Alfa/Transparencia) se deja igual
    }

    auxCtx.putImageData(datos, x, y);
}

function elegirFiltroAlAzar() {
    const nombres = Object.keys(FILTROS);   // ["grises", "brillo", "negativo"]
    return nombres[Math.floor(Math.random() * nombres.length)];
}

function dibujarBoton(b, activo) {
    const radio = 20;
    const relieve = 6;

    // relieve celeste, con sombra proyectada
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = COLORES.botonRelieve;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y + relieve, b.ancho, b.alto, radio);
    ctx.fill();
    ctx.restore();

    // cara del botón
    ctx.save();
    ctx.fillStyle = COLORES.boton;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.ancho, b.alto, radio);
    ctx.fill();
    if (activo) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = COLORES.destacado;
        ctx.stroke();
    }
    ctx.restore();

    // texto
    ctx.fillStyle = COLORES.botonTexto;
    ctx.font = "700 28px " + FUENTE_TEXTO;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(b.texto, b.x + b.ancho / 2, b.y + b.alto / 2, b.ancho - 24);
}

function dibujarMenu() {
    ctx.fillStyle = COLORES.texto;
    ctx.font = "170px " + FUENTE_TITULO;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("BLOCKA", canvas.width / 2, 300);

    dibujarBoton(botonComenzar);

    ctx.fillStyle = COLORES.texto;
    ctx.font = "28px " + FUENTE_TEXTO;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Cantidad de piezas", canvas.width / 2, 400);

    OPCIONES_PIEZAS.forEach(op => {
        dibujarBoton(op, op.filas === FILAS && op.columnas === COLUMNAS);
    });
}

function dibujarHUD() {
    ctx.fillStyle = COLORES.texto;
    ctx.font = "32px " + FUENTE_TEXTO;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("Nivel " + (nivelActual + 1), 40, HUD_ALTO / 2);
    ctx.textAlign = "right";
    ctx.fillText("Tiempo: " + formatearTiempo(tiempoActual()), canvas.width - 40, HUD_ALTO / 2);

    const mejor = records[claveRecord()] !== undefined
        ? formatearTiempo(records[claveRecord()])
        : "--:--.-";

    ctx.fillText("Mejor: " + mejor, canvas.width - 40, HUD_ALTO / 2 + 40);

    const nivel = NIVELES[nivelActual];
    if (nivel.tiempoMax !== undefined) {
        const restante = Math.max(0, nivel.tiempoMax - tiempoActual());
        ctx.fillStyle = restante <= 10000 ? COLORES.alerta : COLORES.texto;
        ctx.fillText("Restante: " + formatearTiempo(restante), canvas.width - 40, HUD_ALTO / 2 + 80);
    }
}

function botonesVisibles() { //cursores
    if (estado === "menu") return [botonComenzar, ...OPCIONES_PIEZAS];
    if (estado === "jugando") return [botonAyudita];
    if (estado === "victoria") return hayNivelSiguiente() ? [botonMenu, botonSiguiente] : [botonMenu];
    if (estado === "derrota") return [botonReintentar, botonMenu];
    return [];
}

function dibujarCargando() {
    ctx.fillStyle = COLORES.texto;
    ctx.font = "40px " + FUENTE_TEXTO;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const texto = mensajeError
        ? mensajeError
        : "Cargando imágenes... " + cargadas + "/" + IMAGENES.length;
    ctx.fillText(texto, canvas.width / 2, canvas.height / 2);
}

function puntoEnRect(x, y, r) {
    return x >= r.x && x < r.x + r.ancho &&
        y >= r.y && y < r.y + r.alto;
}

function hayNivelSiguiente() {
    return nivelActual < NIVELES.length - 1;
}

function tiempoActual() { //performance.now() devuelve el tiempo en milisegundos desde que se abrió la página, con decimales. Se usa para medir intervalos de tiempo.
    if (estado === "jugando") {
        return performance.now() - inicioNivel + penalizacion;
    }
    return tiempoFinal;
}

function formatearTiempo(ms) {
    let minutos = Math.floor(ms / 60000);
    let segundos = Math.floor((ms % 60000) / 1000);
    let decimas = Math.floor((ms % 1000) / 100);

    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}.${decimas}`;
}

function redibujar() {
    dibujarFondo();
    if (estado === "cargando") {
        dibujarCargando();
    } else if (estado === "menu") {
        dibujarMenu();
    } else if (estado === "sorteo") {
        dibujarSorteo();
    } else {
        dibujarHUD();
        dibujarMarco();
        dibujarImagen();
        if (estado === "jugando") {
            dibujarBoton(botonAyudita);
        }
        if (estado === "victoria") {
            dibujarMensajeVictoria();
            dibujarBoton(botonMenu);
            if (hayNivelSiguiente()) {
                dibujarBoton(botonSiguiente);
            }
        }

        if (estado === "derrota") {
            dibujarMensajeDerrota();
            dibujarBoton(botonReintentar);
            dibujarBoton(botonMenu);
        }
    }
}

function bucle() {
    if (estado === "jugando") {
        const nivel = NIVELES[nivelActual];
        if (nivel.tiempoMax !== undefined && tiempoActual() >= nivel.tiempoMax) {
            tiempoFinal = nivel.tiempoMax;
            estado = "derrota";
        }
        redibujar();
    } else if (estado === "sorteo") {
        actualizarSorteo();
        redibujar();
    }
    requestAnimationFrame(bucle);
}

//========Portada y herramientas========//
document.getElementById("boton-jugar").addEventListener("click", function () {
    capaInicio.classList.add("oculto");
    imagenPortada.classList.add("oculto");
});

document.getElementById("boton-reiniciar").addEventListener("click", function () {
    if (estado !== "cargando") {
        estado = "menu";
        redibujar();
    }
});

document.getElementById("boton-pantalla-completa").addEventListener("click", function () {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        pantallaJuego.requestFullscreen();
    }
});

document.getElementById("boton-video").addEventListener("click", function () {
    document.getElementById("video-elemento")
        .scrollIntoView({ behavior: "smooth", block: "center" }); //Lleva al video del juego
});

//=====Extra 1===== Thumbnail + animación
function iniciarSorteo() {
    const n = imagenesCargadas.length;
    indiceElegido = Math.floor(Math.random() * n);

    const totalPasos = 2 * n + indiceElegido;
    tiemposPasos = [];
    let t = 0;
    for (let k = 0; k <= totalPasos; k++) {
        tiemposPasos.push(t);   // en qué momento (ms) arranca el paso k
        t += 50 + k * 6;        // cada paso tarda un poco más: el movimiento se frena. 50 y 6 controlan la velocidad inicial y cuánto se frena. Se puede ajustar para que quede más rápido o más lento
    }

    indiceResaltado = 0;
    inicioSorteo = performance.now();
    estado = "sorteo";
    redibujar();
}

function dibujarMiniaturas() {
    const n = imagenesCargadas.length;
    const columnas = 6;
    const filas = Math.ceil(n / columnas);
    const lado = 200;
    const sep = 24;

    const anchoTotal = columnas * lado + (columnas - 1) * sep;
    const altoTotal = filas * lado + (filas - 1) * sep;
    const x0 = (canvas.width - anchoTotal) / 2;
    const y0 = HUD_ALTO + (canvas.height - HUD_ALTO - altoTotal) / 2;

    imagenesCargadas.forEach((img, i) => {
        const x = x0 + (i % columnas) * (lado + sep);
        const y = y0 + Math.floor(i / columnas) * (lado + sep);

        // recorte cuadrado central
        const l = Math.min(img.width, img.height);
        const sx = (img.width - l) / 2;
        const sy = (img.height - l) / 2;

        ctx.save();
        ctx.globalAlpha = (i === indiceResaltado) ? 1 : 0.45; //Atenúa las no elegidas
        ctx.drawImage(img, sx, sy, l, l, x, y, lado, lado);
        ctx.restore();

        if (i === indiceResaltado) {
            ctx.strokeStyle = COLORES.destacado;
            ctx.lineWidth = 8;
            ctx.strokeRect(x, y, lado, lado);
        }
    });
}

function dibujarSorteo() {
    ctx.fillStyle = COLORES.texto;
    ctx.font = "40px  " + FUENTE_TEXTO;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Nivel " + (nivelActual + 1) + ": sorteando imagen...", canvas.width / 2, HUD_ALTO / 2);
    dibujarMiniaturas();
}

function actualizarSorteo() {
    const transcurrido = performance.now() - inicioSorteo;
    const ultimo = tiemposPasos.length - 1;

    const siguiente = tiemposPasos.findIndex(t => t > transcurrido);
    const actual = (siguiente === -1) ? ultimo : siguiente - 1;

    indiceResaltado = actual % imagenesCargadas.length;

    if (actual === ultimo && transcurrido >= tiemposPasos[ultimo] + PAUSA_FINAL) {
        iniciarNivel(imagenesCargadas[indiceElegido]);
    }
}

//=====Extra 2===== Cantidad de subimagen de la Blocka
function calcularLayout() {
    const anchoMax = canvas.width - 2 * (ANCHO_COLUMNA + SEPARACION + 40); //Espacio horizontal libre para el tablero, dejando 40 px de margen a la izquierda y a la derecha, y dejando espacio para los botones laterales
    const altoMax = canvas.height - HUD_ALTO - MARGEN * 2; //Espacio vertical libre

    tamPieza = Math.floor(Math.min(altoMax / FILAS, anchoMax / COLUMNAS));
    anchoTab = tamPieza * COLUMNAS;
    altoTab = tamPieza * FILAS;

    dx = (canvas.width - anchoTab) / 2;
    dy = HUD_ALTO + (canvas.height - HUD_ALTO - altoTab) / 2;

    const xBotones = dx + anchoTab + SEPARACION;
    botonSiguiente.x = xBotones;
    botonMenu.x = xBotones;
    botonReintentar.x = xBotones;
    botonAyudita.x = xBotones;
}

function claveRecord() {
    return nivelActual + "_" + (FILAS * COLUMNAS);
}

//=====Extra 3===== Ayudita
function usarAyudita() { //Se sortea entre las piezas mal puestas. Se suma una penalización de 5000 ms al tiempo final.
    const incorrectas = piezas.filter(p => anguloNormalizado(p.rotacion) !== 0);
    if (incorrectas.length === 0) return;

    const pieza = incorrectas[Math.floor(Math.random() * incorrectas.length)];
    pieza.rotacion = 0;
    pieza.fija = true;
    penalizacion += 5000;
}

//=====Extra 4===== Temporizador de tiempo máximo. Usa performance.now() para medir el tiempo transcurrido desde que empezó el nivel. Si se supera el tiempo máximo, se marca el estado como "derrota" y se congela el tiempo final.
function dibujarMensajeDerrota() {
    ctx.fillStyle = COLORES.alerta;
    ctx.font = "34px  " + FUENTE_TEXTO;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("¡Se acabó el tiempo!", botonReintentar.x + botonReintentar.ancho / 2, 200);
}

//========Inicio del juego========//

function iniciarNivel(img) {
    calcularLayout();
    const nivel = NIVELES[nivelActual];

    imagenActual = img;
    prepararAuxiliar(img);   // 1. recorte cuadrado en el auxiliar
    crearPiezas();           // 2. piezas con origen en el auxiliar
    aplicarFiltrosDelNivel(nivel); // 3.  le paso el nivel, no nivel.filtros
    nuevoRecord = false;
    inicioNivel = performance.now();
    penalizacion = 0;
    estado = "jugando";
    redibujar();             // 4. dibujar
}

Promise.all([
    document.fonts.load('100px "Bitcount Ink"'),
    document.fonts.load('800 28px "Nunito"')
]).then(redibujar);

precargar(IMAGENES)
    .then(function (imgs) {
        imagenesCargadas = imgs;
        estado = "menu";
        redibujar();
    })
    .catch(function (ruta) {
        mensajeError = "No se pudo cargar " + ruta + ". Recargá la página.";
        redibujar();
    });

bucle(); // inicia el bucle de animación


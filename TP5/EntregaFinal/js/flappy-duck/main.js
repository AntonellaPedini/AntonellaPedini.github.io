const ALTO = 648;   // alto del mundo en unidades de juego
const ALTO_PATO = 111;   // alto del pato en esas mismas unidades

const pantalla = document.getElementById('pantalla-juego');
const elPato = document.getElementById('pato');

const entrada = { impulso: false };
let estado = 'inicio';                         // 'inicio' | 'jugando'
const pajaro = new Pajaro(elPato, ALTO * 0.3);

const ANCHO     = 1152;   // ancho del mundo (648 × 16/9)
const VEL_BASE = 240;              // velocidad normal (unidades/s), igual que --vel en el CSS
let VELOCIDAD = VEL_BASE;          // velocidad actual: cambia durante el turbo
const FACTOR_TURBO = 1.6;          // con turbo, el mundo va 1.6 veces más rápido
let factorMundo = 1;               // 1 = normal, 1.6 = turbo a pleno

// Las capas del fondo, para poder acelerarlas desde JS
const capasParallax = pantalla.getAnimations({ subtree: true })
    .filter(a => a.animationName === 'mover');

const HUECO_INICIAL = 240;
const HUECO_MINIMO  = 150;
const ACHICAR       = 6;      // cuánto se achica el hueco en cada par
const DIST_MIN = 380, DIST_MAX = 560;   // distancia entre pares (variable)
const MARGEN_ARRIBA = 80;
const MARGEN_ABAJO  = 184;    // 144 del pasto del frente + 40 de tronco visible
const SALTO_MAX = 220;        // cuánto puede cambiar la altura del hueco entre pares

const contObstaculos = document.getElementById('obstaculos');
let obstaculos = [];
let hueco = HUECO_INICIAL;
let ultimoCentro = ALTO / 2;
let faltaParaNuevo = 0;       // distancia que falta recorrer antes de crear otro par

const PATO_X = 173;                                  // 15% de 1152
const HIT_PATO = { dx: 24, dy: 28, w: 66, h: 52 };   // el cuerpo, sin las alas
const VIDAS_INICIO = 3;
const T_CHOQUE = 0.9;          // segundos de animación estrellado
const T_INVULNERABLE = 1.8;    // segundos sin poder perder otra vida

let vidas = VIDAS_INICIO;
let tiempoChoque = 0;
let invulnerable = 0;
const T_ALETEO = 0.3;      // segundos de aleteo rápido tras cada impulso
let tiempoAleteo = 0;

const elVidas = document.querySelectorAll('#vidas .corazon');
const pantallaFin = document.getElementById('pantalla-fin');

const contElementos = document.getElementById('elementos');
const elPuntos = document.getElementById('score');
let elementos = [];
let puntos = 0;

const TIEMPO_MAX = 300;            // 5:00 (para probar, poné 30)
const PENALIZACION_PAJARO = 10;    // segundos que suma un pájaro
const BONUS_RELOJ = 10;            // segundos que resta un reloj de arena
const PROB_MONEDA = 0.6;            // probabilidad de que un par de troncos traiga una moneda
const PROB_RELOJ  = 0.12;
const VEL_PAJARO  = 140;           // extra, además de VELOCIDAD

let tiempo = 0;                    // segundos transcurridos
let segMostrado = -1;
let faltaPajaro = 4;               // segundos hasta el próximo pájaro
const elTiempo = document.getElementById('tiempo');

const VIDAS_MAX = VIDAS_INICIO;
const PROB_CORAZON = 0.15;
const PARES_MIN_CORAZON = 5;     // pares de troncos entre un corazón y el siguiente
let paresSinCorazon = 0;

const MONEDAS_PARA_TURBO = 3;
const T_TURBO = 4;            // segundos
let monedasTurbo = 0;         // monedas juntadas desde el último turbo
let turbo = 0;                // segundos de turbo que quedan
const elTurbo = document.getElementById('turbo-info');

document.addEventListener('keydown', (e) => {
    if (e.code !== 'Space' || e.repeat) return;
    if (e.target.matches('input, textarea, button, select')) return;
    e.preventDefault();      // evita que la barra espaciadora haga scroll de la página
    entrada.impulso = true;  // el evento anota
});

pantalla.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.herramientas, .pantalla-fin')) return;
    entrada.impulso = true;
});


function actualizar(dt) {
    // Primer impulso: arranca el juego
    if (estado === 'inicio' && entrada.impulso) {
        estado = 'jugando';
        pantalla.classList.remove('pausado');   // el parallax empieza a moverse
        document.getElementById('capa-inicio').classList.add('oculto');   // NUEVO
    }
    if (estado !== 'jugando') {
        entrada.impulso = false;
        return;
    }

    // El loop decide
    if (entrada.impulso) {
        pajaro.impulsar();
        elPato.classList.add('aleteo');   // NUEVO
        tiempoAleteo = T_ALETEO;          // NUEVO
        entrada.impulso = false;
    }
    pajaro.actualizar(dt);

    // Cronómetro
    tiempo += dt;
    mostrarTiempo();
    if (tiempo >= TIEMPO_MAX) {
        terminar('tiempo');
        return;
    }

    // Límites provisorios (más adelante será un choque)
    if (pajaro.y < 0) { pajaro.y = 0; pajaro.vy = 0; }
    const suelo = ALTO - ALTO_PATO;
    if (pajaro.y > suelo) { pajaro.y = suelo; pajaro.vy = 0; }

    // Mover todos los troncos
    for (const o of obstaculos) o.actualizar(dt);

    // Borrar el más viejo cuando sale de pantalla (de la lista y del DOM)
    if (obstaculos.length > 0 && obstaculos[0].estaFuera()) {
        obstaculos.shift().eliminar();
    }

    faltaPajaro -= dt;
    if (faltaPajaro <= 0) {
        crearPajaro();
        faltaPajaro = aleatorio(3, 6);
    }

    // Crear un par nuevo cada cierta distancia
    faltaParaNuevo -= VELOCIDAD * dt;
    if (faltaParaNuevo <= 0) {
        crearObstaculo();
        faltaParaNuevo = aleatorio(DIST_MIN, DIST_MAX);
    }
    
    if (tiempoAleteo > 0) {
    tiempoAleteo -= dt;
    if (tiempoAleteo <= 0) elPato.classList.remove('aleteo');
    }

    // Detectar choques
    // Los efectos se cuentan con dt (no con setTimeout), así respetan las pausas
    if (tiempoChoque > 0) {
        tiempoChoque -= dt;
        if (tiempoChoque <= 0) elPato.classList.remove('estrellado');
    }
    if (invulnerable > 0) {
        invulnerable -= dt;
        if (invulnerable <= 0) elPato.classList.remove('parpadeo');
    }

    // Cuenta regresiva del turbo
    if (turbo > 0) {
        turbo -= dt;
        if (turbo <= 0) {
            elPato.classList.remove('acelerando');
            invulnerable = Math.max(invulnerable, 0.8);   // un respiro al terminar
            elPato.classList.add('parpadeo');
        }
        actualizarTurboInfo();
    }

        // El mundo acelera con el turbo y vuelve a la normalidad suavemente
        /*factorMundo se acerca de a poco al valor objetivo (1 o 1.6), en vez de saltar de golpe. Con eso se calcula la velocidad de los troncos y los items, y playbackRate hace lo mismo con las animaciones CSS del fondo. Así todo acelera en la misma proporción y la velocidad sigue siendo coherente con el movimiento.*/


    const objetivo = turbo > 0 ? FACTOR_TURBO : 1;
    factorMundo += (objetivo - factorMundo) * Math.min(1, 6 * dt);
    VELOCIDAD = VEL_BASE * factorMundo;
    capasParallax.forEach(a => a.playbackRate = factorMundo);

    // Colisión con los troncos
    if (invulnerable <= 0 && turbo <= 0) {
        const rp = rectPato();
        for (const o of obstaculos) {
            if (o.rectangulos().some(r => chocan(rp, r))) {
                chocar();
                break;
            }
        }
    }

    // Elementos: mover, recoger o borrar
    const rp = rectPato();
    for (let i = elementos.length - 1; i >= 0; i--) {
        const e = elementos[i];
        e.actualizar(dt);
        const inmune = e.tipo === 'pajaro' && turbo > 0;   // con turbo, los pájaros no hacen nada
        if (!inmune && chocan(rp, e.rect())) {
            recoger(e);
            e.eliminar();
            elementos.splice(i, 1);
        } else if (e.estaFuera()) {
            e.eliminar();
            elementos.splice(i, 1);
        }
    }
}

// Funciones auxiliares para crear obstáculos
function aleatorio(min, max) {
    return min + Math.random() * (max - min);
}

function crearObstaculo() {
    const min = MARGEN_ARRIBA + hueco / 2;
    const max = ALTO - MARGEN_ABAJO - hueco / 2;
    const desde = Math.max(min, ultimoCentro - SALTO_MAX);
    const hasta = Math.min(max, ultimoCentro + SALTO_MAX);
    const centro = aleatorio(desde, hasta);

    const previo = obstaculos[obstaculos.length - 1];   // el par anterior, si hay
    obstaculos.push(new Obstaculo(contObstaculos, ANCHO, centro, hueco));
    ultimoCentro = centro;
    hueco = Math.max(HUECO_MINIMO, hueco - ACHICAR);

    if (previo) crearItemEnPasillo(previo);
}

// Moneda, reloj o corazón en el espacio libre entre el par anterior y el nuevo
function crearItemEnPasillo(previo) {
    paresSinCorazon++;

    let tipo;
    if (vidas < VIDAS_MAX && paresSinCorazon >= PARES_MIN_CORAZON
        && Math.random() < PROB_CORAZON) {
        tipo = 'corazon';
    } else {
        const r = Math.random();
        if (r < PROB_RELOJ) tipo = 'reloj';
        else if (r < PROB_RELOJ + PROB_MONEDA) tipo = 'moneda';
        else return;
    }

    const tam = 48;
    const desde = previo.x + ANCHO_TRONCO + 20;
    const hasta = ANCHO - tam - 20;
    if (hasta <= desde) return;

    elementos.push(new Elemento(contElementos, {
        tipo, x: aleatorio(desde, hasta), y: aleatorio(70, 440), w: tam, h: tam
    }));
    if (tipo === 'corazon') paresSinCorazon = 0;
}

function crearPajaro() {
    elementos.push(new Elemento(contElementos, {
        tipo: 'pajaro',
        extra: Math.random() < 0.5 ? 'v1' : 'v2',
        x: ANCHO, y: aleatorio(70, 430), w: 96, h: 96,
        velExtra: VEL_PAJARO,
        margen: 24,
        espejo: true               // los sprites miran a la derecha: acá vienen de frente
    }));
}

// Detecta si el pájaro choca con algún tronco
function chocan(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
        a.y < b.y + b.h && a.y + a.h > b.y;
}

function rectPato() {
    return {
        x: PATO_X + HIT_PATO.dx, y: pajaro.y + HIT_PATO.dy,
        w: HIT_PATO.w, h: HIT_PATO.h
    };
}

function actualizarVidas() {
    elVidas.forEach((c, i) => c.classList.toggle('perdido', i >= vidas));
}

function chocar() {
    vidas--;
    actualizarVidas();
    elPato.classList.add('estrellado', 'parpadeo');
    tiempoChoque = T_CHOQUE;
    invulnerable = T_INVULNERABLE;
    if (vidas <= 0) terminar('vidas');
}

function terminar(motivo) {
    estado = 'fin';
    elPato.classList.remove('parpadeo');
    pantalla.classList.add('pausado');
    document.getElementById('titulo-fin').textContent =
        motivo === 'tiempo' ? '¡Se acabó el tiempo!' : '¡Te quedaste sin vidas!';
    document.getElementById('puntos-final').textContent = puntos;
    document.getElementById('tiempo-final').textContent = formatear(Math.floor(tiempo));

    let record = puntos;
    try {
        record = Math.max(Number(localStorage.getItem('flappyDuckRecord')) || 0, puntos);
        localStorage.setItem('flappyDuckRecord', record);
    } catch (e) {
        console.warn('No se pudo guardar el récord:', e);
    }
    document.getElementById('record-final').textContent = record;

    pantallaFin.classList.remove('oculta');
}

document.getElementById('btn-reintentar').addEventListener('click', reiniciar);
document.getElementById('boton-reiniciar').addEventListener('click', reiniciar);   // el ↻ de la consola

function reiniciar() {
    // Limpiar lo que había en pantalla
    for (const o of obstaculos) o.eliminar();
    for (const e of elementos) e.eliminar();
    obstaculos = [];
    elementos = [];

    // Pato
    pajaro.y = ALTO * 0.3;
    pajaro.vy = 0;
    elPato.classList.remove('estrellado', 'parpadeo', 'acelerando');
    elPato.classList.remove('aleteo');     // NUEVO
    tiempoChoque = 0;
    invulnerable = 0;
    tiempoAleteo = 0;                      // NUEVO

    // Vidas, puntos y tiempo
    vidas = VIDAS_INICIO;
    actualizarVidas();
    puntos = 0;
    elPuntos.textContent = puntos;
    tiempo = 0;
    segMostrado = -1;
    mostrarTiempo();
    elTiempo.classList.remove('sumo', 'resto');

    // Dificultad y generación de obstáculos e items
    hueco = HUECO_INICIAL;
    ultimoCentro = ALTO / 2;
    faltaParaNuevo = 0;
    faltaPajaro = 4;
    paresSinCorazon = 0;

    // Turbo y velocidad del mundo
    turbo = 0;
    monedasTurbo = 0;
    actualizarTurboInfo();
    factorMundo = 1;
    VELOCIDAD = VEL_BASE;
    capasParallax.forEach(a => a.playbackRate = 1);

    // Volver a la pantalla de inicio
    entrada.impulso = false;
    estado = 'inicio';
    pantalla.classList.add('pausado');
    pantallaFin.classList.add('oculta');
    document.getElementById('capa-inicio').classList.remove('oculto');
}

//Agarra moneditas, relojes de arena y pájaros
function recoger(e) {
    if (e.tipo === 'moneda') {
        puntos++;
        elPuntos.textContent = puntos;
        if (turbo <= 0) {                       // durante el turbo no se cuentan
            monedasTurbo++;
            if (monedasTurbo >= MONEDAS_PARA_TURBO) activarTurbo();
            else actualizarTurboInfo();
        }
    } else if (e.tipo === 'reloj') {
        cambiarTiempo(-BONUS_RELOJ, 'resto');
    } else if (e.tipo === 'pajaro') {
        cambiarTiempo(PENALIZACION_PAJARO, 'sumo');
        elPato.classList.add('estrellado');   // reacción del pato
        tiempoChoque = T_CHOQUE;
    } else if (e.tipo === 'corazon') {
        if (vidas < VIDAS_MAX) {
            vidas++;
            actualizarVidas();     // vuelve a pintar los corazones del HUD
        }
    }
}

//Funciones del tiempo
function formatear(seg) {
    return Math.floor(seg / 60) + ':' + String(seg % 60).padStart(2, '0');
}

// Solo toca el DOM cuando cambia el segundo que se ve
function mostrarTiempo() {
    const s = Math.floor(tiempo);
    if (s !== segMostrado) {
        segMostrado = s;
        elTiempo.textContent = formatear(s);
    }
}

function cambiarTiempo(delta, clase) {
    tiempo = Math.max(0, tiempo + delta);
    mostrarTiempo();
    elTiempo.classList.remove('sumo', 'resto');
    void elTiempo.offsetWidth;        // fuerza a que la animación CSS se reinicie
    elTiempo.classList.add(clase);
}

//Funciones apara modo turbo
function actualizarTurboInfo() {
    const texto = turbo > 0
        ? '¡TURBO! ' + Math.ceil(turbo) + 's'
        : 'Turbo: ' + monedasTurbo + '/' + MONEDAS_PARA_TURBO;
    if (elTurbo.textContent !== texto) elTurbo.textContent = texto;   // solo toca el DOM si cambia
    elTurbo.classList.toggle('activo', turbo > 0);
}

function activarTurbo() {
    turbo = T_TURBO;
    monedasTurbo = 0;
    elPato.classList.add('acelerando');
    actualizarTurboInfo();
}

// Dibuja el mundo en la pantalla
function dibujar() {
    const escala = pantalla.clientHeight / ALTO;
    pajaro.dibujar(escala);
    for (const o of obstaculos) o.dibujar(escala);
    for (const e of elementos) e.dibujar(escala);
}

let anterior = performance.now();

function frame(ahora) {
    let dt = (ahora - anterior) / 1000;
    anterior = ahora;
    dt = Math.min(dt, 0.05);

    actualizar(dt);
    dibujar();
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
// js/peg-solitaire/controlador/controlador.js
// CONTROLADOR: escucha el mouse, arrastra fichas, lleva el reloj y le pregunta al Modelo
// si el movimiento es válido. No conoce las reglas (eso es del Modelo) ni dibuja (eso es de la Vista).
import { Tablero } from '../modelo/tablero.js';
import { VistaTablero } from '../vista/vistaTablero.js';

// Tiempo que tiene el jugador para terminar la partida, en segundos (300 = 5 minutos).
// Si se quiere otro tiempo, alcanza con cambiar este número.
const TIEMPO_LIMITE = 300;

export class Controlador {
  /**
   * @param {HTMLCanvasElement} canvas - el canvas del juego
   * @param {Object|null} imagenes - { tipo: Image } con las imágenes de las fichas ya cargadas
   * @param {number} tiempoLimite - segundos que dura la partida (por defecto, TIEMPO_LIMITE)
   */
  constructor(canvas, imagenes = null, tiempoLimite = TIEMPO_LIMITE) {
    this.canvas = canvas;
    this.tablero = new Tablero();                                        // Modelo
    this.vista = new VistaTablero(canvas, this.tablero, imagenes);       // Vista

    // Estado del mouse: null = reposo. Si se está arrastrando una ficha vale
    // { ficha, x, y, dx, dy, destinos } (x,y = centro de la ficha en pantalla,
    // dx,dy = distancia entre el clic y el centro, destinos = celdas a las que puede saltar)
    this.arrastre = null;

    // Aviso de "esta ficha no se puede mover": null (no hay) o { ficha, inicio }
    // (inicio = momento en que se tocó, en milisegundos; sirve para que dure medio segundo)
    this.avisoFicha = null;

    // Estado de la partida
    this.terminado = false;               // true cuando la partida terminó (por la causa que sea)
    this.mensaje = null;                  // cartel de fin de juego: null (no hay) o { titulo, detalle }
    this.tiempoLimite = tiempoLimite;     // segundos que dura la partida
    this.restante = tiempoLimite;         // segundos que quedan (la Vista lo muestra en el reloj)
    this.inicioPartida = Date.now();      // momento en que empezó la partida (en milisegundos)
    this.bucleActivo = false;             // para arrancar el bucle de dibujo una sola vez

    // mousedown en el canvas: solo nos interesa el clic que empieza ADENTRO del tablero.
    // mousemove y mouseup en window: así seguimos enterándonos aunque el mouse se salga del canvas.
    // Usamos flechas para que "this" siga siendo el Controlador.
    canvas.addEventListener('mousedown', e => this.empezarArrastre(e));
    window.addEventListener('mousemove', e => this.seguirArrastre(e));
    window.addEventListener('mouseup', e => this.terminarArrastre(e));

    this.dibujar(0);   // primer cuadro: así el canvas no queda vacío
  }

  /**
   * Convierte las coordenadas del evento a coordenadas INTERNAS del canvas (las de width/height).
   * Hace falta escalar porque el CSS puede estirar el canvas: el tamaño que se ve en pantalla
   * no es el mismo que el tamaño interno.
   * @param {MouseEvent} e
   * @returns {{x: number, y: number}}
   */
  posicionEnCanvas(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (e.clientY - rect.top) * (this.canvas.height / rect.height),
    };
  }

  /**
   * Se llama al apretar el botón del mouse sobre el canvas.
   * Si hay una ficha en esa celda, empieza el arrastre.
   * @param {MouseEvent} e
   */
  empezarArrastre(e) {
    if (this.terminado) return;   // si la partida terminó, ya no se pueden mover fichas
    e.preventDefault();           // evita que el navegador seleccione texto mientras arrastramos

    const pos = this.posicionEnCanvas(e);
    const { fila, col } = this.vista.pixelesACelda(pos.x, pos.y);
    const ficha = this.tablero.obtenerFicha(fila, col);
    if (!ficha) return;   // clic en un hueco vacío o fuera del tablero: no pasa nada

    // Si la ficha no tiene ningún salto posible, no se agarra: avisamos que no se puede mover
    const destinos = this.tablero.calcularDestinos(ficha);
    if (destinos.length === 0) {
      this.avisoFicha = { ficha: ficha, inicio: Date.now() };
      return;
    }

    const centro = this.vista.celdaAPixeles(ficha.fila, ficha.col);
    this.arrastre = {
      ficha,
      x: centro.x,
      y: centro.y,
      dx: pos.x - centro.x,   // dónde agarraste la ficha: así no "salta" al centro del mouse
      dy: pos.y - centro.y,
      destinos: destinos,   // para los hints
    };
  }

  /**
   * Se llama cada vez que se mueve el mouse. Si hay arrastre, la ficha sigue al mouse,
   * pero sin salirse del rectángulo permitido.
   * @param {MouseEvent} e
   */
  seguirArrastre(e) {
    if (!this.arrastre) return;
    const pos = this.posicionEnCanvas(e);
    let x = pos.x - this.arrastre.dx;   // dónde quedaría el centro de la ficha
    let y = pos.y - this.arrastre.dy;

    // La ficha NO puede salir de un rectángulo alrededor del tablero (lo pide la Vista, que conoce
    // las medidas). Math.max y Math.min "recortan" el número: si x es menor que el mínimo vale el mínimo,
    // y si es mayor que el máximo vale el máximo. Así la ficha se frena en el borde del rectángulo.
    const limites = this.vista.limitesArrastre();
    x = Math.max(limites.minX, Math.min(limites.maxX, x));
    y = Math.max(limites.minY, Math.min(limites.maxY, y));

    this.arrastre.x = x;
    this.arrastre.y = y;
  }

  /**
   * Se llama al soltar el botón del mouse. Si se soltó sobre un destino válido, mueve la ficha;
   * si no, no hace nada: el Modelo no cambió, así que la ficha "vuelve sola" a su lugar al redibujar.
   * @param {MouseEvent} e
   */
  terminarArrastre(e) {
    if (!this.arrastre) return;

    const { ficha, x, y } = this.arrastre;
    this.arrastre = null;   // volvemos a reposo

    // El destino se calcula con el CENTRO de la ficha (no con la punta del mouse)
    const { fila, col } = this.vista.pixelesACelda(x, y);

    // saltar() valida adentro y devuelve true solo si movió la ficha
    if (this.tablero.saltar(ficha, fila, col)) {
      // El fin del juego solo puede cambiar después de un movimiento válido
      if (this.tablero.esVictoria()) {
        this.terminarJuego('victoria');
      } else if (!this.tablero.quedanJugadas()) {
        this.terminarJuego('sin-jugadas');
      }
    }
  }

  /**
   * Termina la partida: frena el juego y prepara el cartel que se muestra en pantalla.
   * @param {string} motivo - 'victoria', 'sin-jugadas' o 'tiempo'
   */
  terminarJuego(motivo) {
    this.terminado = true;
    this.arrastre = null;   // por si se estaba arrastrando una ficha justo cuando se acabó el tiempo

    const quedan = this.tablero.fichasRestantes();

    if (motivo === 'victoria') {
      this.mensaje = { titulo: '¡GANASTE!', detalle: 'Quedó una sola ficha' };
    } else if (motivo === 'sin-jugadas') {
      this.mensaje = { titulo: 'SIN MOVIMIENTOS', detalle: 'Quedaron ' + quedan + ' fichas' };
    } else {
      this.mensaje = { titulo: 'SE ACABÓ EL TIEMPO', detalle: 'Quedaron ' + quedan + ' fichas' };
    }
  }

  /**
   * Calcula cuántos segundos le quedan al jugador.
   * @returns {number}
   */
  calcularRestante() {
    const pasados = (Date.now() - this.inicioPartida) / 1000;   // segundos que pasaron desde que empezó

    // Math.ceil redondea para arriba: así el reloj muestra 00:00 recién cuando el tiempo se terminó de verdad
    let restante = Math.ceil(this.tiempoLimite - pasados);

    // Para que nunca quede un número negativo
    if (restante < 0) {
      restante = 0;
    }

    return restante;
  }

  /**
   * Le pide a la Vista que dibuje un cuadro con el estado actual del juego.
   * @param {number} tiempo - milisegundos que manda requestAnimationFrame (para animar los hints)
   */
  dibujar(tiempo) {
    // El aviso dura medio segundo (500 ms). Pasado ese tiempo, lo borramos.
    let aviso = null;
    if (this.avisoFicha) {
      const transcurrido = Date.now() - this.avisoFicha.inicio;
      if (transcurrido < 500) {
        aviso = { ficha: this.avisoFicha.ficha, transcurrido: transcurrido };
      } else {
        this.avisoFicha = null;
      }
    }

    this.vista.dibujarJuego({
      arrastre: this.arrastre,
      tiempo: tiempo,
      restante: this.restante,
      mensaje: this.mensaje,
      aviso: aviso,
    });
  }

  /**
   * Bucle del juego: se repite unas 60 veces por segundo.
   * En cada vuelta actualiza el reloj y redibuja todo. Así la ficha sigue al mouse,
   * los hints se animan y el reloj cuenta, aunque el jugador no toque nada.
   */
  iniciarBucle() {
    if (this.bucleActivo) return;
    this.bucleActivo = true;

    const cuadro = (tiempo) => {
      // Mientras la partida siga, actualizamos el reloj. Si llega a 0, se acabó el tiempo.
      // (Cuando la partida termina, el reloj queda congelado en el último valor.)
      if (!this.terminado) {
        this.restante = this.calcularRestante();
        if (this.restante === 0) this.terminarJuego('tiempo');
      }

      this.dibujar(tiempo);
      requestAnimationFrame(cuadro);   // pedimos el próximo cuadro
    };
    requestAnimationFrame(cuadro);
  }

  /** Arranca la partida (se llama al tocar "A JUGAR!"): el reloj empieza a contar desde acá. */
  iniciar() {
    this.inicioPartida = Date.now();
    this.iniciarBucle();
  }

  /** Reinicia la partida (se llama al tocar ↻): tablero nuevo, reloj de nuevo en el máximo y sin cartel. */
  reiniciar() {
    this.tablero.reiniciar();
    this.arrastre = null;
    this.avisoFicha = null;
    this.terminado = false;
    this.mensaje = null;
    this.restante = this.tiempoLimite;
    this.inicioPartida = Date.now();
    this.dibujar(0);   // por si el bucle todavía no arrancó
  }
}
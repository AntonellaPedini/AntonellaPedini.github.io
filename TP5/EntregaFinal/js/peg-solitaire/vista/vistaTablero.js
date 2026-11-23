// js/peg-solitaire/vista/vistaTablero.js
// VISTA: dibuja el juego en el canvas y traduce entre píxeles y celdas de la matriz.
// No decide reglas ni escucha el mouse: eso es del Modelo y del Controlador.
import { VistaFicha } from './vistaFicha.js';
import { VistaHint } from './vistaHint.js';

export class VistaTablero {
  /**
   * @param {HTMLCanvasElement} canvas - el canvas donde se dibuja
   * @param {Tablero} tablero - el Modelo. La Vista solo lo LEE para saber qué dibujar
   * @param {Object|null} imagenes - { tipo: Image } ya precargadas (las fichas se dibujan con estas imágenes)
   */
  constructor(canvas, tablero, imagenes = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.tablero = tablero;
    this.imagenes = imagenes;

    this.tamCelda = 58;   // lado de cada celda, en píxeles del canvas

    // Radio de cada ficha (y de su agujero). Es el 47% de la celda: así las fichas
    // quedan casi pegadas, con muy poco aire entre una y otra. Si se quieren más separadas, bajar el 0.47.
    this.radioFicha = this.tamCelda * 0.47;

    // Cada una se encarga de dibujar su parte: las fichas normales y los hints (fichas fantasma)
    this.vistaFicha = new VistaFicha(this.ctx, this.radioFicha, imagenes);
    this.vistaHint = new VistaHint(this.ctx, this.radioFicha, imagenes);

    // Desfase para que el tablero quede centrado en la ESTRELLA de la imagen de fondo.
    // (642, 340) es el centro de la estrella dentro del canvas de 1280x720.
    this.offsetX = 642 - tablero.columnas * this.tamCelda / 2;
    this.offsetY = 340 - tablero.filas * this.tamCelda / 2;
  }

  /**
   * Traduce un punto del canvas (en píxeles) a la celda de la matriz donde cae.
   * Si el punto queda fuera del tablero devuelve números fuera de rango (negativos o muy grandes);
   * el Modelo ya sabe que esas celdas no existen (esCeldaValida), así que no hace falta chequearlo acá.
   * @returns {{fila: number, col: number}}
   */
  pixelesACelda(x, y) {
    return {
      fila: Math.floor((y - this.offsetY) / this.tamCelda),
      col: Math.floor((x - this.offsetX) / this.tamCelda),
    };
  }

  /**
   * Traduce una celda de la matriz al píxel donde está su CENTRO.
   * Es la inversa de pixelesACelda. Las fichas se dibujan centradas en este punto.
   * @returns {{x: number, y: number}}
   */
  celdaAPixeles(fila, col) {
    return {
      x: this.offsetX + col * this.tamCelda + this.tamCelda / 2,
      y: this.offsetY + fila * this.tamCelda + this.tamCelda / 2,
    };
  }

  /**
   * Dibuja un cuadro completo. Se llama cada vez que hay que refrescar la pantalla.
   * El orden importa: lo que se dibuja después queda arriba de lo anterior.
   * @param {Object} estado - lo que cambia durante el juego:
   *        arrastre ({ficha, x, y, destinos} o null), tiempo (ms, para animar los hints),
   *        restante (segundos que quedan), mensaje ({titulo, detalle} o null)
   *        y aviso ({ficha, transcurrido} o null: la ficha que no se puede mover y hace cuánto se tocó)
   */
  dibujarJuego(estado = {}) {
    const arrastre = estado.arrastre ?? null;   // si no viene nada, es que no se está arrastrando
    const tiempo = estado.tiempo ?? 0;
    const restante = estado.restante ?? null;   // null = no hay reloj para mostrar
    const mensaje = estado.mensaje ?? null;     // null = no hay cartel para mostrar
    const aviso = estado.aviso ?? null;         // null = no hay ninguna ficha avisando que no se mueve

    this.pintarFondo();
    this.pintarAgujeros();

    // Si hay una ficha en la mano, marcamos a dónde puede saltar (los destinos están en vacíos,
    // así que no tapan a ninguna ficha quieta)
    if (arrastre) this.pintarHints(arrastre.ficha, arrastre.destinos, tiempo);

    // Fichas quietas (la que se está arrastrando se saltea: se dibuja al final)
    for (const ficha of this.tablero.fichas) {
      if (arrastre && arrastre.ficha === ficha) continue;
      let { x, y } = this.celdaAPixeles(ficha.fila, ficha.col);

      // Si es la ficha que no se puede mover, la hacemos temblar: la corremos a izquierda y derecha
      // con Math.sin (que va y viene entre -1 y 1), multiplicado por 5 píxeles
      const esLaDelAviso = aviso && aviso.ficha === ficha;
      if (esLaDelAviso) x = x + Math.sin(aviso.transcurrido / 25) * 5;

      this.vistaFicha.pintar(ficha, x, y);
      if (esLaDelAviso) this.pintarAroRojo(x, y);   // y le dibujamos un aro rojo alrededor
    }

    // La ficha arrastrada va última, para que quede por encima de todo
    if (arrastre) this.vistaFicha.pintar(arrastre.ficha, arrastre.x, arrastre.y);

    // El reloj y, si la partida terminó, el cartel van al final para quedar arriba de todo
    if (restante !== null) this.pintarReloj(restante);
    if (mensaje) this.pintarMensaje(mensaje);
  }

  /**
   * Dibuja un aro rojo alrededor de una ficha, para avisar que no se puede mover.
   * @param {number} x - centro horizontal de la ficha, en píxeles del canvas
   * @param {number} y - centro vertical de la ficha, en píxeles del canvas
   */
  pintarAroRojo(x, y) {
    const { ctx, radioFicha } = this;
    ctx.beginPath();
    ctx.arc(x, y, radioFicha + 2, 0, Math.PI * 2);   // un poquito más grande que la ficha
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ff3b3b';
    ctx.stroke();
  }

  /**
   * Dibuja el reloj arriba a la izquierda (sobre el agua, para no tapar la estrella), con el formato MM:SS.
   * En los últimos 10 segundos se pone rojo para avisar.
   * @param {number} segundos - segundos que quedan
   */
  pintarReloj(segundos) {
    const { ctx, canvas } = this;

    // Pasamos los segundos a minutos y segundos
    const minutos = Math.floor(segundos / 60);   // por ejemplo 125 segundos -> 2 minutos
    const resto = segundos % 60;                 // y 5 segundos que sobran

    // Si el número tiene una sola cifra le agregamos un 0 adelante (7 -> 07)
    let textoMinutos = minutos;
    if (minutos < 10) {
      textoMinutos = '0' + minutos;
    }
    let textoSegundos = resto;
    if (resto < 10) {
      textoSegundos = '0' + resto;
    }
    const texto = textoMinutos + ':' + textoSegundos;   // por ejemplo "02:05"

    // Un fondo oscuro semitransparente para que el número se lea bien
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(20, 20, 170, 52);

    // El número: blanco normalmente, rojo cuando quedan 10 segundos o menos
    ctx.font = '32px Silkscreen, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = segundos <= 10 ? '#ff5a5a' : 'white';
    ctx.fillText(texto, 105, 47);
  }

  /**
   * Dibuja el cartel de fin de juego: oscurece todo el canvas y escribe el título y el detalle.
   * @param {{titulo: string, detalle: string}} mensaje
   */
  pintarMensaje(mensaje) {
    const { ctx, canvas } = this;

    // Una capa negra semitransparente sobre todo el juego
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Título grande, en amarillo
    ctx.font = '56px Silkscreen, monospace';
    ctx.fillStyle = '#ffd34d';
    ctx.fillText(mensaje.titulo, canvas.width / 2, canvas.height / 2 - 40);

    // Detalle más chico, en blanco
    ctx.font = '28px Silkscreen, monospace';
    ctx.fillStyle = 'white';
    ctx.fillText(mensaje.detalle, canvas.width / 2, canvas.height / 2 + 20);

    // Instrucción para volver a jugar
    ctx.font = '20px Silkscreen, monospace';
    ctx.fillStyle = '#a0f5ff';
    ctx.fillText('Tocá el botón de reiniciar para jugar de nuevo', canvas.width / 2, canvas.height / 2 + 80);
  }

  /**
   * Pinta el fondo de todo el canvas: la imagen del mar con la estrella de madera.
   * Si la imagen no se pudo cargar, pinta un degradé azul para que el juego se vea igual.
   */
  pintarFondo() {
    const { ctx, canvas } = this;
    const fondo = this.imagenes ? this.imagenes.fondo : null;

    if (fondo) {
      ctx.drawImage(fondo, 0, 0, canvas.width, canvas.height);   // la estira al tamaño del canvas
    } else {
      const degradado = ctx.createLinearGradient(0, 0, 0, canvas.height);
      degradado.addColorStop(0, '#0e5a85');
      degradado.addColorStop(1, '#052a43');
      ctx.fillStyle = degradado;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  /** Dibuja un agujero oscuro en cada celda que existe en el tablero (según la matriz del Modelo). */
  pintarAgujeros() {
    const { ctx, tablero, radioFicha } = this;
    for (let fila = 0; fila < tablero.filas; fila++) {
      for (let col = 0; col < tablero.columnas; col++) {
        if (!tablero.esCeldaValida(fila, col)) continue;
        const { x, y } = this.celdaAPixeles(fila, col);
        ctx.beginPath();
        ctx.arc(x, y, radioFicha, 0, Math.PI * 2);
        ctx.fillStyle = '#031a2b';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#1b6f9c';
        ctx.stroke();
      }
    }
  }

  /**
   * Dibuja los hints: una ficha fantasma en cada celda a la que puede saltar la ficha agarrada.
   * Acá solo pasamos cada celda a píxeles; cómo se ve el fantasma lo decide VistaHint.
   * @param {Ficha} ficha - la ficha que se está arrastrando (de ella sale la imagen del fantasma)
   * @param {{fila: number, col: number}[]} destinos - celdas a las que puede saltar la ficha
   * @param {number} tiempo - milisegundos que pasaron desde que se cargó la página
   */
  pintarHints(ficha, destinos, tiempo) {
    for (const destino of destinos) {
      const { x, y } = this.celdaAPixeles(destino.fila, destino.col);
      this.vistaHint.pintarFantasma(ficha, x, y, tiempo);
    }
  }
}
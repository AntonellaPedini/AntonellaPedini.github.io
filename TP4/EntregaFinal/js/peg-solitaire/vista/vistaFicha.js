// js/peg-solitaire/vista/vistaFicha.js
// VISTA DE UNA FICHA: sabe dibujar UNA ficha en el canvas, con la imagen de su tipo.
// No conoce el tablero ni las reglas: solo recibe la ficha y el punto (x, y) donde dibujarla.
// VistaTablero la usa para las fichas normales y VistaHint hereda de ella para el fantasma.

/** Colores de respaldo: se usan solo si la imagen de un tipo de ficha no se pudo cargar. */
const COLORES_FICHA = {
  medusa: '#a855f7',   // violeta
  estrella: '#f59e0b', // naranja
  pez: '#3b82f6',      // azul
  almeja: '#14b8a6',   // verde agua
};

export class VistaFicha {
  /**
   * @param {CanvasRenderingContext2D} ctx - el "pincel" del canvas
   * @param {number} radio - radio de la ficha en píxeles
   * @param {Object|null} imagenes - { tipo: Image } con las imágenes ya cargadas (o null si no hay)
   */
  constructor(ctx, radio, imagenes = null) {
    this.ctx = ctx;
    this.radio = radio;
    this.imagenes = imagenes;
  }

  /**
   * Dibuja una ficha centrada en (x, y). Si la imagen de su tipo está cargada, la dibuja recortada
   * con un círculo (clip) para que no se vea el fondo cuadrado de la imagen.
   * Si no hay imagen (o no se pudo cargar), dibuja un círculo de color.
   * @param {Ficha} ficha - la ficha a dibujar (de ella se usa solo el tipo)
   * @param {number} x - centro horizontal, en píxeles del canvas
   * @param {number} y - centro vertical, en píxeles del canvas
   * @param {number} radio - tamaño con el que dibujarla (si no se manda, usa el radio normal)
   */
  pintar(ficha, x, y, radio = this.radio) {
    const { ctx } = this;
    const imagen = this.imagenes ? this.imagenes[ficha.tipo] : null;

    if (imagen) {
      ctx.save();                                   // guardamos el estado para sacar el recorte después
      ctx.beginPath();
      ctx.arc(x, y, radio, 0, Math.PI * 2);         // la forma del recorte: un círculo
      ctx.clip();                                   // desde acá, solo se pinta adentro del círculo
      const lado = radio * 2 * 1.04;                // un poquito más grande, para que no queden bordes
      ctx.drawImage(imagen, x - lado / 2, y - lado / 2, lado, lado);
      ctx.restore();                                // se termina el recorte
    } else {
      ctx.beginPath();
      ctx.arc(x, y, radio, 0, Math.PI * 2);
      ctx.fillStyle = COLORES_FICHA[ficha.tipo];
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.stroke();
    }
  }
}
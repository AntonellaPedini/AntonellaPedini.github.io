// js/peg-solitaire/vista/vistaHint.js
// VISTA DE LOS HINTS: dibuja una "ficha fantasma" en cada agujero al que puede saltar la ficha
// agarrada: la misma imagen, pero transparente y latiendo, para que se vea dónde va a quedar.
// Es una ficha (hereda de VistaFicha), pero dibujada con transparencia y animada.
import { VistaFicha } from './vistaFicha.js';

export class VistaHint extends VistaFicha {
  // No hace falta escribir constructor: usa el de VistaFicha (ctx, radio, imagenes).

  /**
   * Dibuja el fantasma de una ficha centrado en (x, y).
   * @param {Ficha} ficha - la ficha que se arrastra (de ella sale la imagen del fantasma)
   * @param {number} x - centro horizontal, en píxeles del canvas
   * @param {number} y - centro vertical, en píxeles del canvas
   * @param {number} tiempo - milisegundos que pasaron (es lo que hace que todo se mueva)
   */
  pintarFantasma(ficha, x, y, tiempo) {
    // Math.sin da un número que va y viene entre -1 y 1: con él hacemos "latir" al fantasma
    const latido = Math.sin(tiempo / 250);

    const radio = this.radio + latido * 2;       // el fantasma se agranda y se achica un poquito
    const transparencia = 0.4 + latido * 0.15;   // y se aclara y se oscurece (0 = invisible, 1 = sólido)

    this.ctx.save();                             // guardamos el estado para no alterar lo que se dibuje después
    this.ctx.globalAlpha = transparencia;        // todo lo que se dibuje desde acá sale transparente
    this.pintar(ficha, x, y, radio);             // dibujamos la ficha con el método heredado de VistaFicha
    this.ctx.restore();                          // volvemos al estado normal (sin transparencia)
  }
}
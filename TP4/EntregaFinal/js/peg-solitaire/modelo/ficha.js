// MODELO: una ficha sabe QUÉ es (su tipo) y DÓNDE está (fila y columna de la matriz).
// No sabe dibujarse ni nada de píxeles: eso es trabajo de la Vista.

/**
 * Tipos de ficha disponibles. Son solo estéticos: todas las fichas juegan exactamente igual.
 * La Vista usa este valor para elegir qué imagen dibujar.
 * Para sumar otro tipo, solo hay que agregarlo acá y cargar su imagen en la Vista.
 */
export const TIPOS_FICHA = ['medusa', 'estrella', 'pez', 'almeja'];

export class Ficha {
  /**
   * @param {number} fila - fila de la matriz donde está la ficha
   * @param {number} col  - columna de la matriz donde está la ficha
   * @param {string} tipo - uno de TIPOS_FICHA; define qué imagen usa la Vista
   */
  constructor(fila, col, tipo) {
    this.fila = fila;
    this.col = col;
    this.tipo = tipo;
  }

  /**
   * Cambia la ficha de celda.
   * Solo la llama el Tablero cuando un movimiento ya fue validado.
   * @param {number} fila - nueva fila
   * @param {number} col  - nueva columna
   */
  moverA(fila, col) {
    this.fila = fila;
    this.col = col;
  }
}
// MODELO: guarda dónde está cada ficha y conoce las reglas del Peg Solitaire.
// No sabe nada de canvas, píxeles ni mouse: eso es de la Vista y del Controlador.
import { Ficha, TIPOS_FICHA } from './ficha.js';

/**
 * Forma del tablero (clásico, en cruz). Es una matriz de 7x7:
 *   1 = hay un agujero en esa celda
 *   0 = no hay nada (queda fuera del tablero)
 * Son 33 agujeros: 32 fichas y un agujero libre en el centro.
 * Si se quisiera otra forma, alcanza con cambiar esta matriz.
 */
const FORMA = [
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
];

/** Celda que arranca vacía: el centro del tablero. */
const CENTRO = { fila: 3, col: 3 };

/**
 * Direcciones de salto, como [cambio de fila, cambio de columna].
 * Un salto avanza 2 celdas y siempre en línea recta (arriba, abajo, izquierda o derecha).
 */
const DIRECCIONES = [[-2, 0], [2, 0], [0, -2], [0, 2]];

export class Tablero {
  /** Crea el tablero con las fichas en su posición inicial. */
  constructor() {
    this.forma = FORMA;
    this.reiniciar();
  }

  /**
   * Deja el tablero como al empezar: todas las fichas en su lugar y el centro vacío.
   * this.grilla[fila][col] guarda la Ficha que está en esa celda, o null si está vacía.
   * El tipo de cada ficha se sortea al azar entre los de TIPOS_FICHA (solo cambia cómo se ve).
   */
  reiniciar() {
    this.grilla = this.forma.map((filaForma, fila) =>
      filaForma.map((hayAgujero, col) => {
        if (!hayAgujero) return null;                                  // fuera del tablero
        if (fila === CENTRO.fila && col === CENTRO.col) return null;   // agujero central vacío
        // Math.random() da un número entre 0 y 1; multiplicado por la cantidad de tipos y
        // redondeado para abajo, da una posición al azar de la lista (0, 1, 2 o 3)
        const posicion = Math.floor(Math.random() * TIPOS_FICHA.length);
        return new Ficha(fila, col, TIPOS_FICHA[posicion]);
      })
    );
  }

  /** Cantidad de filas de la matriz. */
  get filas() {
    return this.forma.length;
  }

  /** Cantidad de columnas de la matriz. */
  get columnas() {
    return this.forma[0].length;
  }

  /** Lista de todas las fichas que hay en el tablero (la Vista la recorre para dibujarlas). */
  get fichas() {
    // flat() junta todas las filas en una sola lista y filter() descarta las celdas vacías (null)
    return this.grilla.flat().filter(ficha => ficha !== null);
  }

  /**
   * Indica si (fila, col) es una celda que existe en el tablero (un agujero de la cruz).
   * @returns {boolean} false si cae fuera de la matriz o en una zona vacía de la forma
   */
  esCeldaValida(fila, col) {
    return fila >= 0 && fila < this.filas &&
           col >= 0 && col < this.columnas &&
           this.forma[fila][col] === 1;
  }

  /**
   * Devuelve la ficha que hay en la celda, o null si está vacía o no existe.
   * El Controlador la usa después de convertir el píxel del clic a (fila, col).
   */
  obtenerFicha(fila, col) {
    return this.esCeldaValida(fila, col) ? this.grilla[fila][col] : null;
  }

  /**
   * Indica si ir de la posición de la ficha a (filaDestino, colDestino) es un salto recto:
   * exactamente 2 celdas en una dirección y 0 en la otra. Nunca en diagonal.
   */
  esSaltoEnLinea(ficha, filaDestino, colDestino) {
    const dFila = Math.abs(filaDestino - ficha.fila);
    const dCol = Math.abs(colDestino - ficha.col);
    return (dFila === 2 && dCol === 0) || (dFila === 0 && dCol === 2);
  }

  /**
   * Regla completa del movimiento. Es válido si se cumple todo esto:
   *  - la ficha realmente está en el tablero,
   *  - el destino es una celda del tablero y está vacío,
   *  - es un salto recto,
   *  - hay una ficha en la celda del medio (la que se va a comer).
   * @returns {boolean}
   */
  puedeSaltar(ficha, filaDestino, colDestino) {
    if (!ficha || this.obtenerFicha(ficha.fila, ficha.col) !== ficha) return false;
    if (!this.esCeldaValida(filaDestino, colDestino)) return false;
    if (this.obtenerFicha(filaDestino, colDestino) !== null) return false;   // destino ocupado
    if (!this.esSaltoEnLinea(ficha, filaDestino, colDestino)) return false;

    const filaMedio = (ficha.fila + filaDestino) / 2;
    const colMedio = (ficha.col + colDestino) / 2;
    return this.obtenerFicha(filaMedio, colMedio) !== null;                  // algo para saltar
  }

  /**
   * Hace el salto: la ficha se mueve al destino y la ficha saltada desaparece.
   * Si el movimiento no es válido no toca nada. Por eso, cuando el jugador suelta la ficha
   * en un lugar inválido, el Modelo no cambia y la Vista la dibuja otra vez donde estaba.
   * @returns {boolean} true si se hizo el movimiento, false si era inválido
   */
  saltar(ficha, filaDestino, colDestino) {
    if (!this.puedeSaltar(ficha, filaDestino, colDestino)) return false;

    const filaMedio = (ficha.fila + filaDestino) / 2;
    const colMedio = (ficha.col + colDestino) / 2;

    this.grilla[ficha.fila][ficha.col] = null;     // la celda de origen queda vacía
    this.grilla[filaMedio][colMedio] = null;       // la ficha saltada se elimina
    ficha.moverA(filaDestino, colDestino);         // la ficha cambia de celda...
    this.grilla[filaDestino][colDestino] = ficha;  // ...y la grilla lo registra
    return true;
  }

  /**
   * Lista las celdas a las que puede saltar esa ficha. Sirve para dibujar los hints.
   * @returns {{fila: number, col: number}[]} vacía si la ficha no tiene movimientos
   */
  calcularDestinos(ficha) {
    const movimientos = [];
    for (const [dFila, dCol] of DIRECCIONES) {
      const fila = ficha.fila + dFila;
      const col = ficha.col + dCol;
      if (this.puedeSaltar(ficha, fila, col)) {
        movimientos.push({ fila, col });
      }
    }
    return movimientos;
  }

  /**
   * Indica si todavía se puede jugar: alcanza con que UNA ficha tenga al menos un movimiento.
   * find recorre las fichas y se detiene apenas encuentra la primera que se puede mover.
   * Si no encuentra ninguna, devuelve undefined.
   * @returns {boolean} false significa que el juego terminó
   */
  quedanJugadas() {
    const fichaQueSePuedeMover = this.fichas.find(ficha => {
      return this.calcularDestinos(ficha).length > 0;
    });
    return fichaQueSePuedeMover !== undefined;
  }

  /** Cantidad de fichas que quedan en el tablero. */
  fichasRestantes() {
    return this.fichas.length;
  }

  /** El jugador ganó si queda una única ficha. */
  esVictoria() {
    return this.fichasRestantes() === 1;
  }
}
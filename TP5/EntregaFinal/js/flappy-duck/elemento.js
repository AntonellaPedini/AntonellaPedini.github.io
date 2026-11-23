const TAM_MONEDA = 48;   // 16px de la hoja × 3

class Elemento {
    constructor(contenedor, { tipo, x, y, w, h, velExtra = 0, margen = 0, extra = '' , espejo = false }) {
        this.tipo = tipo;          // 'moneda', 'pajaro', 'reloj'
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.velExtra = velExtra;  // velocidad propia, además de la del mundo
        this.margen = margen;      // cuánto se achica el rectángulo de choque
        this.espejo = espejo;      // true = dibujarlo dado vuelta horizontalmente

        this.elemento = document.createElement('div');
        this.elemento.className = 'elemento item-' + tipo + (extra ? ' ' + extra : '');
        contenedor.appendChild(this.elemento);
    }

    actualizar(dt) {
        this.x -= (VELOCIDAD + this.velExtra) * dt;
    }

    dibujar(escala) {
        const flip = this.espejo ? ' scaleX(-1)' : '';
        this.elemento.style.transform =
            `translate(${this.x * escala}px, ${this.y * escala}px)${flip}`;
    }

    rect() {
        const m = this.margen;
        return { x: this.x + m, y: this.y + m, w: this.w - 2 * m, h: this.h - 2 * m };
    }

    estaFuera() {
        return this.x + this.w < 0;
    }

    eliminar() {
        this.elemento.remove();
    }
}
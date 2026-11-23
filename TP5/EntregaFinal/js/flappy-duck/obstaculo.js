const ANCHO_TRONCO = 180;
// Parte sólida del tronco: 100 de los 180 de ancho, centrada
const HIT_TRONCO = { dx: 40, w: 100 };

class Obstaculo {
    constructor(contenedor, x, centro, hueco) {
        this.x = x;
        this.centro = centro;   // altura del centro del hueco
        this.hueco = hueco;     // alto del hueco

        this.elemento = document.createElement('div');
        this.elemento.className = 'obstaculo';

        const arriba = document.createElement('div');
        arriba.className = 'tronco arriba';
        arriba.style.height = ((centro - hueco / 2) / ALTO * 100) + '%';

        const abajo = document.createElement('div');
        abajo.className = 'tronco abajo';
        abajo.style.height = ((ALTO - (centro + hueco / 2)) / ALTO * 100) + '%';

        this.elemento.append(arriba, abajo);
        contenedor.appendChild(this.elemento);
    }

    actualizar(dt) {
        this.x -= VELOCIDAD * dt;
    }

    dibujar(escala) {
        this.elemento.style.transform = `translateX(${this.x * escala}px)`;
    }

    estaFuera() {
        return this.x + ANCHO_TRONCO < 0;
    }

    eliminar() {
        this.elemento.remove();
    }

    // Los dos rectángulos de choque: el tronco de arriba y el de abajo
    rectangulos() {
        const x = this.x + HIT_TRONCO.dx;
        return [
            { x, y: 0, w: HIT_TRONCO.w, h: this.centro - this.hueco / 2 },
            { x, y: this.centro + this.hueco / 2, w: HIT_TRONCO.w, h: ALTO }
        ];
    }
}
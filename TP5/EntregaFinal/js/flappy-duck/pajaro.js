const GRAVEDAD = 1000;   // px/s²
const IMPULSO = 300;    // px/s

class Pajaro {
    constructor(elemento, y) {
        this.elemento = elemento;
        this.y = y;     // posición vertical (la verdad vive acá, no en el DOM)
        this.vy = 0;     // velocidad vertical
    }

    impulsar() {
        this.vy = -IMPULSO;          // ASIGNA, no suma. Negativo = hacia arriba
    }

    actualizar(dt) {
        this.vy += GRAVEDAD * dt;    // la gravedad cambia la velocidad
        this.y += this.vy * dt;     // la velocidad cambia la posición
    }

    dibujar(escala) {
        this.elemento.style.transform = `translateY(${this.y * escala}px)`;
    }
}
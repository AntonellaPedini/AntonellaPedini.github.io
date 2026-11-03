// js/peg-solitaire/main.js
// Punto de entrada del juego: carga las imágenes, crea el Controlador (que arma el Modelo y la Vista)
// y conecta los botones de la página con la partida.
import { Controlador } from './controlador/controlador.js';
import { cargarImagenesFichas } from './vista/imagenesFichas.js';

const canvas = document.getElementById('canvas-juego');

// Esperamos a que las imágenes estén cargadas y recién ahí armamos el juego
cargarImagenesFichas().then((imagenes) => {
  const controlador = new Controlador(canvas, imagenes);

  // "A JUGAR!": oculta la capa de inicio y arranca la partida
  document.getElementById('boton-jugar').addEventListener('click', () => {
    document.getElementById('capa-inicio').classList.add('oculto');
    controlador.iniciar();
  });

  // Botón de reiniciar (↻)
  document.getElementById('boton-reiniciar').addEventListener('click', () => {
    controlador.reiniciar();
  });

  // Botón de pantalla completa (⛶): pone el televisor a pantalla completa
  // y, si ya está en pantalla completa, lo vuelve a la normalidad
  document.getElementById('boton-pantalla-completa').addEventListener('click', () => {
    const pantalla = document.getElementById('pantalla-juego');

    if (document.fullscreenElement) {
      document.exitFullscreen();        // ya estaba en pantalla completa: salimos
    } else {
      pantalla.requestFullscreen();     // entramos en pantalla completa
    }
  });
});
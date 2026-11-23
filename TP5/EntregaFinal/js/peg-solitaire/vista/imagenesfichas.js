// Carga las imágenes de las fichas ANTES de empezar a jugar.
// Si dibujamos una imagen que todavía no terminó de cargar, no se ve nada (y no da error),
// por eso el juego espera a que estén listas usando una promesa.

// Una imagen por cada tipo de ficha. Las rutas son relativas al HTML (no a este archivo).
const RUTAS = {
  medusa: 'img/fichas/medusa.png',
  estrella: 'img/fichas/estrella.png',
  pez: 'img/fichas/pez.png',
  almeja: 'img/fichas/almeja.png',     // ojo: esta línea lleva coma al final
  fondo: 'img/fondo-tablero.png',      // la imagen de fondo del tablero
};
/**
 * Carga UNA imagen y devuelve una promesa.
 * La promesa se cumple (resolve) cuando la imagen terminó de cargar.
 * Si la imagen falla, se cumple igual pero con null: el juego sigue y usa un círculo de color.
 * @param {string} ruta
 * @returns {Promise}
 */
function cargarImagen(ruta) {
  return new Promise((resolve) => {
    const imagen = new Image();
    imagen.onload = () => resolve(imagen);        // cargó bien
    imagen.onerror = () => {                      // no se encontró o falló
      console.warn('No se pudo cargar la imagen:', ruta);
      resolve(null);
    };
    imagen.src = ruta;                            // recién acá empieza la carga
  });
}

/**
 * Carga las imágenes de TODOS los tipos de ficha.
 * Promise.all espera a que terminen todas las promesas y devuelve sus resultados en orden.
 * @returns {Promise} que se cumple con un objeto como { medusa: imagen, estrella: imagen }
 */
export function cargarImagenesFichas() {
  const tipos = Object.keys(RUTAS);   // ['medusa', 'estrella']
  const promesas = [];

  for (let i = 0; i < tipos.length; i++) {
    promesas.push(cargarImagen(RUTAS[tipos[i]]));
  }

  return Promise.all(promesas).then((imagenes) => {
    const resultado = {};
    for (let i = 0; i < tipos.length; i++) {
      resultado[tipos[i]] = imagenes[i];   // medusa -> su imagen, estrella -> su imagen
    }
    return resultado;
  });
}

(function () { //Envolura IIFE, función que se define y ejecuta en el actor para que las constantes queden privadas y no choquen con variables de otros scripts

  const loader   = document.getElementById('loader'); //Contenedor completo de la pántalla de carga
  const progress = document.getElementById('progress'); //<circle> svg que dibuja el arco que se llena
  const percentEl= document.getElementById('percent'); //texto del %
  const duck     = document.getElementById('duck'); //pato Duckade

  const r = 130; //Radio del círculo
  const circumference = 2 * Math.PI * r; //Fórmula de la circunferencia
  progress.style.strokeDasharray = circumference; //Define el patrón de guiones
  progress.style.strokeDashoffset = circumference; //Desplza el patrón a lo largo del trazo

  const DURATION = 5000; // 5 segundos, una sola vez (no loop)
  let start = null;

  function easeOutQuad(t) { return 1 - Math.pow(1 - t, 2); } //Función para que muestre el progreso rápido al principio y más lento en el último cuarto del recorrido

  //Cada cuadro de la animación. Se llama antes de dibujar cada cuadro de la pantalla
  function frame(ts) {
    if (start === null) start = ts;
    const t = Math.min((ts - start) / DURATION, 1); //Calcula la fracción de tiempo transcurrido
    const eased = easeOutQuad(t); //Aplica la curva, de tiempo lineal a progreso con aceleración

    progress.style.strokeDashoffset = circumference * (1 - eased); //Actualiza el anillo

    percentEl.textContent = Math.floor(eased * 100) + '%'; //Va actualizando el texto del porcentaje

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      percentEl.textContent = '100%';
      duck.classList.add('done');
      onLoadingComplete();
    }
  }

  function onLoadingComplete() {
    // Oculta el loader y deja ver el contenido real de la página.
    // Si tu contenido tiene display:none u opacity:0 hasta acá, sacaselo en este punto.
    loader.classList.add('hidden');
    setTimeout(() => { loader.style.display = 'none'; }, 400); // espera a que termine la transición de opacidad y saca el loader del todo
  }

  requestAnimationFrame(frame);
})();
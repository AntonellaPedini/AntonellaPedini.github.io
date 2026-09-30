
(function () {
  const loader   = document.getElementById('loader');
  const progress = document.getElementById('progress');
  const percentEl= document.getElementById('percent');
  const duck     = document.getElementById('duck');

  const r = 130;
  const circumference = 2 * Math.PI * r;
  progress.style.strokeDasharray = circumference;
  progress.style.strokeDashoffset = circumference;

  const DURATION = 5000; // 5 segundos, una sola vez (no loop)
  let start = null;

  function easeOutQuad(t) { return 1 - Math.pow(1 - t, 2); }

  function frame(ts) {
    if (start === null) start = ts;
    const t = Math.min((ts - start) / DURATION, 1);
    const eased = easeOutQuad(t);

    progress.style.strokeDashoffset = circumference * (1 - eased);

    percentEl.textContent = Math.floor(eased * 100) + '%';

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
    setTimeout(() => { loader.style.display = 'none'; }, 400); // espera a que termine la transición de opacidad
  }

  requestAnimationFrame(frame);
})();
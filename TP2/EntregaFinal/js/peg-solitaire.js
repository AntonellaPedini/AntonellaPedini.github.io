document.addEventListener('DOMContentLoaded', () => {
// ==========================================================================
  // 1. FORMULARIO DE COMENTARIOS (Simulación interactiva de UI)
  // ==========================================================================
 // 1. Enviar nuevos comentarios
  const formulario = document.getElementById('formulario-comentario');
  const input = document.getElementById('input-comentario');
  const lista = document.getElementById('lista-comentarios');

  if (formulario && input && lista) {
    formulario.addEventListener('submit', (evento) => {
      evento.preventDefault();
      const texto = input.value.trim();
      if (texto === '') return;

 const nuevoComentario = document.createElement('article');
nuevoComentario.className = 'comentario';
nuevoComentario.innerHTML = `
  <div class="comentario__avatar avatar--teal">
    <svg viewBox="0 0 24 24" class="icono-avatar-silueta"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
  </div>
  <div class="comentario__cuerpo">
    <p class="comentario__usuario">VOS DECIS:</p>
    <p class="comentario__mensaje"></p>
    <div class="comentario__acciones">
      <button type="button" class="comentario__reaccion-circulo" aria-label="Me gusta">
        <svg class="icono-reaccion" viewBox="0 0 22 22">
          <path class="reaccion-base" d="M1 11a10 10 0 1 0 20 0 10 10 0 0 0-20 0Z"/>
          <path class="reaccion-expresion" d="M7.67 7.67h.01M14.33 7.67h.01"/>
          <path class="reaccion-expresion reaccion-boca-rellena" d="M6.56 12.11c0 1.18.46 2.31 1.3 3.14.83.84 1.96 1.3 3.14 1.3s2.31-.46 3.14-1.3c.84-.83 1.3-1.96 1.3-3.14H6.56Z"/>
        </svg>
      </button>
      <button type="button" class="comentario__reaccion-circulo" aria-label="No me gusta">
        <svg class="icono-reaccion" viewBox="0 0 22 22">
          <path class="reaccion-base" d="M1 11a10 10 0 1 0 20 0 10 10 0 0 0-20 0Z"/>
          <path class="reaccion-expresion" d="M7.67 8.78h.01M14.33 8.78h.01"/>
          <path class="reaccion-expresion" d="M8.22 14.61a3.87 3.87 0 0 1 5.56 0"/>
        </svg>
      </button>
      <button type="button" class="comentario__responder">responder</button>
    </div>
  </div>
`;
nuevoComentario.querySelector('.comentario__mensaje').textContent = texto; // seguro
lista.prepend(nuevoComentario);
    });
  }

 // Delegación de clic para botones de reacción
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.comentario__reaccion-circulo');
    if (!btn) return;

    const grupoAcciones = btn.closest('.comentario__acciones');
    const estabaActivo = btn.classList.contains('activo');

    // Deseleccionamos otras reacciones del mismo comentario
    if (grupoAcciones) {
      grupoAcciones.querySelectorAll('.comentario__reaccion-circulo').forEach(b => {
        b.classList.remove('activo');
      });
    }

    // Toggle: si no estaba activo, lo activamos
    if (!estabaActivo) {
      btn.classList.add('activo');
    }
  });


  // ==========================================================================
  // 3. BOTÓN FAVORITO (Toggle estado activo)
  // ==========================================================================
  const btnFavorito = document.getElementById('btn-favorito');
  if (btnFavorito) {
    btnFavorito.addEventListener('click', () => {
      btnFavorito.classList.toggle('activo');
    });
  }

  // ==========================================================================
  // 4. VENTANAS MODALES (Compartir e Instrucciones)
  // ==========================================================================
  function vincularModal(btnAbrirId, modalId, btnCerrarId) {
    const btnAbrir = document.getElementById(btnAbrirId);
    const modal = document.getElementById(modalId);
    const btnCerrar = document.getElementById(btnCerrarId);

    if (btnAbrir && modal) {
      btnAbrir.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.remove('oculto');
      });

      if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
          modal.classList.add('oculto');
        });
      }

      // Cerrar al clickear fuera de la tarjeta
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.add('oculto');
        }
      });
    }
  }

  // Modal Compartir (accesible desde el panel lateral y desde la ficha de descripción)
  vincularModal('boton-compartir', 'modal-compartir', 'btn-cerrar-modal');
  vincularModal('btn-compartir', 'modal-compartir', 'btn-cerrar-modal');

  // Modal Instrucciones (accesible desde el panel lateral)
  vincularModal('boton-instrucciones', 'modal-instrucciones', 'btn-cerrar-instrucciones');

// ==========================================================================
  // REPRODUCTOR DE VIDEO CON CONTROL DE VOLUMEN
  // ==========================================================================
  const video = document.getElementById('video-elemento');
  const overlayVideo = document.getElementById('video-overlay');
  const botonPlayGrande = document.getElementById('video-boton-play');
  const botonPlayChico = document.getElementById('video-play-chico');
  const botonMute = document.getElementById('video-mute');
  const sliderVolumen = document.getElementById('video-volumen');
  const barraProgreso = document.getElementById('video-barra-progreso');
  const progresoRelleno = document.getElementById('video-progreso-relleno');
  const botonReiniciar = document.getElementById('video-reiniciar');
  const botonCompartirVideo = document.getElementById('video-compartir');
  const modalCompartir = document.getElementById('modal-compartir');

  if (video) {
    // 1. Play / Pausa
    function alternarPlay() {
      if (video.paused) {
        video.play();
        if (overlayVideo) overlayVideo.classList.add('oculto');
        if (botonPlayGrande) botonPlayGrande.classList.add('oculto');
        if (botonPlayChico) botonPlayChico.textContent = '⏸';
      } else {
        video.pause();
        if (botonPlayChico) botonPlayChico.textContent = '▶';
      }
    }

    if (botonPlayGrande) botonPlayGrande.addEventListener('click', alternarPlay);
    if (botonPlayChico) botonPlayChico.addEventListener('click', alternarPlay);

    // 2. Control de volumen real con el slider
    if (sliderVolumen) {
      sliderVolumen.addEventListener('input', (e) => {
        video.volume = e.target.value;
        video.muted = (video.volume === 0);
        if (botonMute) botonMute.textContent = video.muted ? '🔇' : '🔊';
      });
    }

    // 3. Botón de Mute
    if (botonMute) {
      botonMute.addEventListener('click', () => {
        video.muted = !video.muted;
        botonMute.textContent = video.muted ? '🔇' : '🔊';
        if (sliderVolumen) sliderVolumen.value = video.muted ? 0 : video.volume;
      });
    }

    // 4. Progreso de la barra roja
    video.addEventListener('timeupdate', () => {
      if (progresoRelleno && video.duration) {
        const porcentaje = (video.currentTime / video.duration) * 100;
        progresoRelleno.style.width = porcentaje + '%';
      }
    });

    // 5. Clic en la barra para adelantar / retroceder
    if (barraProgreso) {
      barraProgreso.addEventListener('click', (evento) => {
        const rect = barraProgreso.getBoundingClientRect();
        const porcentajeClic = (evento.clientX - rect.left) / rect.width;
        video.currentTime = porcentajeClic * video.duration;
      });
    }

    // 6. Botón Reiniciar
    if (botonReiniciar) {
      botonReiniciar.addEventListener('click', () => {
        video.currentTime = 0;
        video.play();
      });
    }

    // 7. Botón Compartir del video (abre el modal que ya tenías)
    if (botonCompartirVideo && modalCompartir) {
      botonCompartirVideo.addEventListener('click', () => {
        modalCompartir.classList.remove('oculto');
      });
    }

    // Al terminar el video
    video.addEventListener('ended', () => {
      if (overlayVideo) overlayVideo.classList.remove('oculto');
      if (botonPlayGrande) botonPlayGrande.classList.remove('oculto');
      if (botonPlayChico) botonPlayChico.textContent = '▶';
    });
  }



/*Menús desplegables del carrito y del usuario*/
const dropdowns = document.querySelectorAll('.panel-izquierdo');

function cerrarDropdowns() {
    dropdowns.forEach(wrap => {
        wrap.querySelector('.panel-desplegable').classList.remove('abierto');
        wrap.querySelector('.icono-btn').setAttribute('aria-expanded', 'false');
    });
}

dropdowns.forEach(wrap => {
    const boton = wrap.querySelector('.icono-btn');
    const panel = wrap.querySelector('.panel-desplegable');

    boton.addEventListener('click', () => {
        const estabaAbierto = panel.classList.contains('abierto');
        cerrarDropdowns();                    // cierra el otro (uno solo a la vez)
        if (!estabaAbierto) {
            panel.classList.add('abierto');
            boton.setAttribute('aria-expanded', 'true');
        }
    });
});

document.addEventListener('click', e => {
    if (!e.target.closest('.panel-izquierdo')) cerrarDropdowns();   // click afuera
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') cerrarDropdowns();
});

/*Menu hamburguesa toggle*/ 
const botonHamburguesa = document.querySelector('.menu-hamburguesa');
const menuDesplegable = document.querySelector('.menu-desplegable');


botonHamburguesa.addEventListener('click', () => 
    menuDesplegable.classList.toggle('abierto'));

});


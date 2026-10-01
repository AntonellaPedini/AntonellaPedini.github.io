document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', e => {
        e.preventDefault();

        // Valida todos los campos y marca los incorrectos
        let todoOk = true;
        form.querySelectorAll('.input-container input').forEach(input => {
            if (!validarCampo(input)) todoOk = false;
        });

        if (!todoOk) {
            form.querySelector('.invalido input').focus(); // lleva el cursor al primer error
            return;
        }

        form.classList.add('exito');

        const destino = form.dataset.redirect;

        setTimeout(() => {
            if (destino) {
                window.location.href = destino;   // login: después de la animación, va al home
            } else {
                form.classList.remove('exito');   // registro: vuelve al estado inicial
                form.reset();
            }
        }, 3200);
    });
});
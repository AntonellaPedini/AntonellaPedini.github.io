document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', e => {
        e.preventDefault();

        // Solo aplica al registro: validar que las contraseñas coincidan
        const pass = form.querySelector('[name="password"]');
        const repeat = form.querySelector('[name="repeat-password"]');
        if (repeat) {
            repeat.setCustomValidity(
                pass.value !== repeat.value ? 'Las contraseñas no coinciden' : ''
            );
        }

        if (!form.checkValidity()) {
            form.reportValidity();               // muestra el mensaje nativo
            form.classList.add('error');
            setTimeout(() => form.classList.remove('error'), 500);
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
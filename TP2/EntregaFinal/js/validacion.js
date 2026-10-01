const mensajes = {
    valueMissing: 'Este campo es obligatorio',
    typeMismatch: 'El formato no es válido',
};

function validarCampo(input) {
    const contenedor = input.closest('.input-container');
    const span = contenedor.querySelector('.mensaje-error');

    // Caso especial: repetir contraseña
    if (input.name === 'repeat-password') {
        const pass = input.closest('form').querySelector('[name="password"]').value;
        input.setCustomValidity(input.value !== pass ? 'Las contraseñas no coinciden' : '');
    }

    if (input.checkValidity()) {
        contenedor.classList.remove('invalido');
        span.textContent = '';
        return true;
    }

    let texto = input.validationMessage;
    if (input.validity.valueMissing) texto = mensajes.valueMissing;
    else if (input.validity.typeMismatch) texto = mensajes.typeMismatch;

    span.textContent = texto;

    // Reinicia la animación de sacudida si ya estaba inválido
    contenedor.classList.remove('invalido');
    void contenedor.offsetWidth;
    contenedor.classList.add('invalido');
    return false;
}

// Una vez marcado como inválido, se corrige en vivo mientras escribe
document.querySelectorAll('.input-container input').forEach(input => {
    input.addEventListener('input', () => {
        const contenedor = input.closest('.input-container');
        if (contenedor.classList.contains('invalido')) {
            validarCampo(input);
        }

        // Si cambia la contraseña, revisa de nuevo el "repetir contraseña"
        if (input.name === 'password') {
            const repeat = input.closest('form').querySelector('[name="repeat-password"]');
            if (repeat && repeat.closest('.input-container').classList.contains('invalido')) {
                validarCampo(repeat);
            }
        }
    });
});
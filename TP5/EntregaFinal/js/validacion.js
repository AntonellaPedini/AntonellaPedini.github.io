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

    //Si el campo es válido, remueve la clase del contenedor, borra el texto del error y devuelve true
    if (input.checkValidity()) {
        contenedor.classList.remove('invalido');
        span.textContent = '';
        return true;
    }

    //Si el campo no es válido
    let texto = input.validationMessage;
    if (input.validity.valueMissing) texto = mensajes.valueMissing;
    else if (input.validity.typeMismatch) texto = mensajes.typeMismatch;

    span.textContent = texto;

    // Reinicia la animación de sacudida si ya estaba inválido
    contenedor.classList.remove('invalido');
    void contenedor.offsetWidth;
    contenedor.classList.add('invalido');
    return false; //exito.js lo usa para decidir si seguir o no
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
document.querySelectorAll('form').forEach(form => { //Busca todos los forms de la página y ejecuta el bloque por cada uno
    form.addEventListener('submit', e => {
        e.preventDefault(); //Evita que se recargue la página

        // Valida todos los campos y marca los incorrectos
        let todoOk = true;
        form.querySelectorAll('.input-container input').forEach(input => { //Bussca todos los input que estén denro de un input-container, solo dentro del form actual
            if (!validarCampo(input)) todoOk = false; //validarCampo esta en validacion.js
        });

        if (!todoOk) {
            form.querySelector('.invalido input').focus(); // lleva el cursor al primer error
            return;
        }

        //Si todo está bien -> éxito
        form.classList.add('exito');

        const destino = form.dataset.redirect; //Para que redirija si tiene a dónde ir

        setTimeout(() => {
            if (destino) { //Si el form tiene data-redirect, entra y navega hacia esa página
                window.location.href = destino;   // login: después de la animación, va al home
            } else {
                form.classList.remove('exito');   // registro: vuelve al estado inicial
                form.reset();
            }
        }, 3200); //Duración de la animación
    });
});
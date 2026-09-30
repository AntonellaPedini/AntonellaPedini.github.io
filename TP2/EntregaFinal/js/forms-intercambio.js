/*Intercambio de formularios de inicio sesión y registro*/
const btnRegistrar = document.querySelector('.btn-registrar');
const btnVolverLogin = document.querySelector('.btn-iniciarSesion');
const formLogin = document.querySelector('.login-container');
const formRegistro = document.querySelector('.registro-container');

if (btnRegistrar && formLogin && formRegistro) {
    btnRegistrar.addEventListener('click', () => {
        formLogin.classList.add('oculto');
        formRegistro.classList.remove('oculto');
    });
}

if (btnVolverLogin && formLogin && formRegistro) {
    btnVolverLogin.addEventListener('click', () => {
        formRegistro.classList.add('oculto');
        formLogin.classList.remove('oculto');
    });
}

/*Los if están porque al ser un archivo compartido por tres páginas html, si en algún lado encuentra algo que no existe (por ejemplo los botones iniciar sesión y registrar de los formularios), el query selector devuelve error de tipo null para los elementos que no encuentra y corta la ejecución. 
Por eso se envuelve cada bloque en un if que chequea que el elemento no sea null, así el script sigue funcionando aunque el elemento que busca no esté en la página actual.*/
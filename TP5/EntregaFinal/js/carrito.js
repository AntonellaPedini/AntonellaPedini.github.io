(function () { //Envoltura para función que se ejecuta de inmediato. Define una función anónima que se ejecuta en el acto.
    const CLAVE = 'duckade-carrito'; //Para guardar el carrito en localStorage

    const lista = document.querySelector('#menu-carrito .panel-lista'); //Se guarda la referencia para poder meter los <li>
    const totalEl = document.querySelector('#menu-carrito .panel-total span:last-child'); //Agarra el span del total
    const badge = document.querySelector('.badge-carrito'); //El circulito con la cant. de juegos agregados

    // Carrito: array de { nombre, precio } (precio en número)
    let carrito = cargar();

    function cargar() { //Se llena con lo que ya esté cargado en caso de reaload de la página
        try {
            return JSON.parse(localStorage.getItem(CLAVE)) || []; //Trae el texto guardado o null/array vacío si nunca se guardó nada, el parse lo convierte a array
        } catch (e) {
            return []; //En caso de texto corrupto, lo atrapa y devuelve array vacío
        }
    }

    function guardar() {
        localStorage.setItem(CLAVE, JSON.stringify(carrito)); //Inverso de cargar. De array a texto, y se guarda bajo la etiqueta CLAVE
    }

    // "USD $11,50" -> 11.5
    function parsearPrecio(texto) {
        const limpio = texto.replace(/[^\d,]/g, '').replace(',', '.'); //Todo lo que no sea dígito ni coma, se borra, y se reemplaza la coma por un punto
        return parseFloat(limpio) || 0; //Se reemplaza "11.50" por 11.5 o 0 (si el resultado no es un número)
    }

    // 11.5 -> "USD $11,50"
    function formatearPrecio(numero) { //Inverso de pasearPrecio
        return 'USD $' + numero.toLocaleString('es-AR', { //Usa las reglas argentinas
            minimumFractionDigits: 2, //Se fuerzan 2 decimales siempre
            maximumFractionDigits: 2
        });
    }

    function render() { //Dibuja el carrito en pantalla. Borra y redibuja todo el contenido del carrito cada vez que algo cambia.
        lista.innerHTML = ''; //Vacía la lista, borra todos los <li> actuales

        carrito.forEach(function (item, i) { //Recorre el array para cada juego, item es el objeto {nombr, precio}, i es su posición
            const li = document.createElement('li');

            const nombre = document.createElement('span');
            nombre.textContent = item.nombre;

            const precio = document.createElement('span');
            precio.textContent = formatearPrecio(item.precio);

            const quitar = document.createElement('button');
            quitar.type = 'button';
            quitar.className = 'btn-quitar';
            quitar.dataset.indice = i; //Para "pegarle" al botón la posición del juego que le corresponde
            quitar.setAttribute('aria-label', 'Quitar ' + item.nombre); //Accesibilidad
            quitar.textContent = '✕';

            li.append(nombre, precio, quitar);
            lista.appendChild(li);
        });

        const total = carrito.reduce(function (suma, item) { //reduce recorre el array acumulando un valor, que queda guardado en total
            return suma + item.precio;
        }, 0);

        totalEl.textContent = formatearPrecio(total);
        badge.textContent = carrito.length; //Muestra la cant. de juegos
        badge.style.display = carrito.length ? '' : 'none';
    }

    function agregar(card) { //Recibe la card del juego, busca dentro nombre y precio, y toma el texto
        const nombre = card.querySelector('.juego-nombre').textContent.trim(); //trim borra espacios o saltos de línea
        const precio = parsearPrecio(card.querySelector('.juego-precio').textContent);

        // some verifica si ya hay en el carrito algún juego con el mismo nombre para no agregarlo dos veces
        if (carrito.some(function (item) { return item.nombre === nombre; })) {
            return false;
        }

        carrito.push({ nombre: nombre, precio: precio }); //Agrego el juego al array
        guardar(); //Lo guarda en localStorage
        render(); //Redibuja la pantalla
        return true;
    }

    // Un solo listener para todos los botones
    document.addEventListener('click', function (e) {
        const btnAgregar = e.target.closest('.btn-agregar'); //e.target es donde se clickea, el closest sube por los padres hasta encontrar un elemento con la clase btn-agregar. Si no encuentra ninguno, devuelve null
        if (btnAgregar) {
            const card = btnAgregar.closest('.juego-card'); //Desde el botón sube hasta su propia card y llama a agregar
            const agregado = agregar(card); //Queda true o false depende de lo que se devuelva arriba

            // Feedback visual simple del botón
            const original = btnAgregar.innerHTML;
            btnAgregar.disabled = true;
            btnAgregar.textContent = agregado ? '¡AGREGADO!' : 'YA ESTÁ EN EL CARRITO';
            setTimeout(function () {
                btnAgregar.innerHTML = original;
                btnAgregar.disabled = false;
            }, 1200);
            return;
        }

        const btnQuitar = e.target.closest('.btn-quitar'); //Si el click fue en un botón X, lee su data-indice que llega como texto
        if (btnQuitar) {
            carrito.splice(Number(btnQuitar.dataset.indice), 1);// lo pasa a número con Number y lo borra del array
            guardar(); //Guarda
            render(); //Redibuja
        }
    });

    render(); //Se ejecuta una vez al cargar la página para dibujar lo que haya ya en localStorage
})();
document.addEventListener('DOMContentLoaded', () => {
    
    const tablaPlatillos = document.getElementById('tablaPlatillos');
    
    // Variables para Agregar
    const btnGuardarNuevo = document.getElementById('btnGuardarNuevo');
    const formAgregar = document.getElementById('formAgregar');

    // Variables para Editar
    const btnGuardarEdicion = document.getElementById('btnGuardarEdicion');
    let filaEnEdicion = null; // Aquí guardaremos temporalmente la fila que estamos editando

    if (btnGuardarNuevo) {
        btnGuardarNuevo.addEventListener('click', () => {
            const nombre = document.getElementById('addNombre').value.trim();
            const receta = document.getElementById('addReceta').value.trim();
            const precio = document.getElementById('addPrecio').value.trim();
            const estado = document.getElementById('addEstado').value;

            if (nombre === "" || receta === "" || precio === "") {
                alert("Por favor, completa todos los campos.");
                return;
            }

            const nuevaId = tablaPlatillos.rows.length + 1;
            const badgeClass = estado === "Disponible" ? "bg-success" : "bg-danger";

            const nuevaFila = document.createElement('tr');
            nuevaFila.innerHTML = `
                <td>${nuevaId}</td>
                <td>${nombre}</td>
                <td>${receta}</td>
                <td>$${precio}</td>
                <td><span class="badge ${badgeClass}">${estado}</span></td>
                <td>
                    <button class="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#modalEditar">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="this.closest('tr').remove()">Eliminar</button>
                </td>
            `;

            tablaPlatillos.appendChild(nuevaFila);
            formAgregar.reset();

            const modalElement = document.getElementById('modalAgregar');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
        });
    }


    tablaPlatillos.addEventListener('click', (event) => {
        
        // Verificamos si lo que se hizo clic fue un botón de "Editar" (clase btn-warning)
        if (event.target.classList.contains('btn-warning')) {
            
            // Obtenemos la fila (<tr>) completa a la que pertenece ese botón
            filaEnEdicion = event.target.closest('tr');

            // Extraemos todas las celdas (<td>) de esa fila
            const celdas = filaEnEdicion.querySelectorAll('td');

            // Obtenemos el texto de cada celda (0: ID, 1: Nombre, 2: Receta, 3: Precio, 4: Estado)
            const nombreActual = celdas[1].innerText;
            const recetaActual = celdas[2].innerText;
            // Al precio le quitamos el símbolo "$" para que se vea bien en el input
            const precioActual = celdas[3].innerText.replace('$', '').trim(); 
            const estadoActual = celdas[4].innerText.trim();

            // Pasamos los datos extraídos a los inputs del Modal de Edición
            document.getElementById('editNombre').value = nombreActual;
            document.getElementById('editReceta').value = recetaActual;
            document.getElementById('editPrecio').value = precioActual;
            document.getElementById('editEstado').value = estadoActual;
        }
    });

    if (btnGuardarEdicion) {
        btnGuardarEdicion.addEventListener('click', () => {
            
            // Solo continuamos si hay una fila seleccionada para editar
            if (filaEnEdicion) {
                
                // Obtenemos los nuevos valores del formulario de edición
                const nuevoNombre = document.getElementById('editNombre').value.trim();
                const nuevaReceta = document.getElementById('editReceta').value.trim();
                const nuevoPrecio = document.getElementById('editPrecio').value.trim();
                const nuevoEstado = document.getElementById('editEstado').value;

                // Validación simple
                if (nuevoNombre === "" || nuevaReceta === "" || nuevoPrecio === "") {
                    alert("Por favor, completa todos los campos de edición.");
                    return;
                }

                // Seleccionamos las celdas de la fila que estamos editando y las sobreescribimos
                const celdas = filaEnEdicion.querySelectorAll('td');
                celdas[1].innerText = nuevoNombre;
                celdas[2].innerText = nuevaReceta;
                celdas[3].innerText = `$${nuevoPrecio}`;

                // Actualizamos el color del "badge" de estado
                const badgeClass = nuevoEstado === "Disponible" ? "bg-success" : "bg-danger";
                celdas[4].innerHTML = `<span class="badge ${badgeClass}">${nuevoEstado}</span>`;

                // Cerramos el modal de Bootstrap
                const modalElement = document.getElementById('modalEditar');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                modalInstance.hide();

                // Limpiamos la variable para futuras ediciones
                filaEnEdicion = null;
            }
        });
    }
});
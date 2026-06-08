document.addEventListener('DOMContentLoaded', () => {

    const tablaPlatillos = document.getElementById('tablaPlatillos');

    // Variables para Agregar
    const btnGuardarNuevo = document.getElementById('btnGuardarNuevo');
    const formAgregar = document.getElementById('formAgregar');

    // Variables para Editar
    const btnGuardarEdicion = document.getElementById('btnGuardarEdicion');
    let idEnEdicion = null;

    // URL del API
    const API_URL = '/api/platillos';

    // Función para cargar los platillos desde la base de datos
    const cargarPlatillos = async () => {
        try {
            const respuesta = await fetch(API_URL);
            const platillos = await respuesta.json();

            tablaPlatillos.innerHTML = '';

            platillos.forEach((platillo, index) => {
                const badgeClass = platillo.estado === "Disponible" ? "bg-success" : "bg-danger";
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${platillo.nombre}</td>
                    <td>${platillo.receta}</td>
                    <td>$${platillo.precio}</td>
                    <td><span class="badge ${badgeClass}">${platillo.estado}</span></td>
                    <td>
                        <button class="btn btn-warning btn-sm btn-editar" data-id="${platillo._id}" data-bs-toggle="modal" data-bs-target="#modalEditar">Editar</button>
                        <button class="btn btn-danger btn-sm btn-eliminar" data-id="${platillo._id}">Eliminar</button>
                    </td>
                `;
                tablaPlatillos.appendChild(fila);
            });
        } catch (error) {
            console.error('Error al cargar platillos:', error);
        }
    };

    // Llamar a cargar platillos al inicio
    cargarPlatillos();

    if (btnGuardarNuevo) {
        btnGuardarNuevo.addEventListener('click', async () => {
            const nombre = document.getElementById('addNombre').value.trim();
            const receta = document.getElementById('addReceta').value.trim();
            const precio = document.getElementById('addPrecio').value.trim();
            const estado = document.getElementById('addEstado').value;

            if (nombre === "" || receta === "" || precio === "") {
                alert("Por favor, completa todos los campos.");
                return;
            }

            try {
                const respuesta = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ nombre, receta, precio, estado })
                });

                if (respuesta.ok) {
                    formAgregar.reset();
                    const modalElement = document.getElementById('modalAgregar');
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    modalInstance.hide();
                    cargarPlatillos();
                } else {
                    alert('Error al guardar el platillo');
                }
            } catch (error) {
                console.error('Error al guardar platillo:', error);
            }
        });
    }

    tablaPlatillos.addEventListener('click', async (event) => {

        // Editar el Platillo
        if (event.target.classList.contains('btn-editar')) {
            const filaEnEdicion = event.target.closest('tr');
            idEnEdicion = event.target.getAttribute('data-id');

            const celdas = filaEnEdicion.querySelectorAll('td');

            const nombreActual = celdas[1].innerText;
            const recetaActual = celdas[2].innerText;
            const precioActual = celdas[3].innerText.replace('$', '').trim();
            const estadoActual = celdas[4].innerText.trim();

            document.getElementById('editNombre').value = nombreActual;
            document.getElementById('editReceta').value = recetaActual;
            document.getElementById('editPrecio').value = precioActual;
            document.getElementById('editEstado').value = estadoActual;
        }

        // Elimina el Platillo
        if (event.target.classList.contains('btn-eliminar')) {
            const idEliminar = event.target.getAttribute('data-id');
            if (confirm('¿Estás seguro de que deseas eliminar este platillo?')) {
                try {
                    const respuesta = await fetch(`${API_URL}/${idEliminar}`, {
                        method: 'DELETE'
                    });

                    if (respuesta.ok) {
                        cargarPlatillos();
                    } else {
                        alert('Error al eliminar el platillo');
                    }
                } catch (error) {
                    console.error('Error al eliminar platillo:', error);
                }
            }
        }
    });

    if (btnGuardarEdicion) {
        btnGuardarEdicion.addEventListener('click', async () => {
            if (idEnEdicion) {
                const nombre = document.getElementById('editNombre').value.trim();
                const receta = document.getElementById('editReceta').value.trim();
                const precio = document.getElementById('editPrecio').value.trim();
                const estado = document.getElementById('editEstado').value;

                if (nombre === "" || receta === "" || precio === "") {
                    alert("Por favor, completa todos los campos de edición.");
                    return;
                }

                try {
                    const respuesta = await fetch(`${API_URL}/${idEnEdicion}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ nombre, receta, precio, estado })
                    });

                    if (respuesta.ok) {
                        const modalElement = document.getElementById('modalEditar');
                        const modalInstance = bootstrap.Modal.getInstance(modalElement);
                        modalInstance.hide();

                        idEnEdicion = null;
                        cargarPlatillos();
                    } else {
                        alert('Error al actualizar el platillo');
                    }
                } catch (error) {
                    console.error('Error al actualizar platillo:', error);
                }
            }
        });
    }
});
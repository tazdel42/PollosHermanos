document.addEventListener('DOMContentLoaded', () => {

    const tablaSucursales = document.getElementById('tablaSucursales');

    //Variables para Agregar
    const btnGuardarNuevo = document.getElementById('btnGuardarNuevo');
    const formAgregar = document.getElementById('formAgregar');

    //Variables para Editar
    const btnGuardarEdicion = document.getElementById('btnGuardarEdicion');
    let idEnEdicion = null;

    //URL del API
    const API_URL = '/api/sucursales';

    //Función para cargar sucursales desde la base de datos
    const cargarSucursales = async () => {
        try {
            const respuesta = await fetch(API_URL, { headers: window.getAuthHeaders() });
            const sucursales = await respuesta.json();

            tablaSucursales.innerHTML = '';

            sucursales.forEach((sucursal, index) => {
                const badgeClass = sucursal.estado === "Activa" ? "bg-success" : "bg-danger";
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${sucursal.nombre}</td>
                    <td>${sucursal.direccion}</td>
                    <td>${sucursal.telefono}</td>
                    <td><span class="badge ${badgeClass}">${sucursal.estado}</span></td>
                    <td>
                        <button class="btn btn-warning btn-sm btn-editar" data-id="${sucursal._id}" data-bs-toggle="modal" data-bs-target="#modalEditar">Editar</button>
                        <button class="btn btn-danger btn-sm btn-eliminar" data-id="${sucursal._id}">Eliminar</button>
                    </td>
                `;
                tablaSucursales.appendChild(fila);
            });
        } catch (error) {
            console.error('Error al cargar sucursales:', error);
        }
    };

    //Llama a cargar sucursales al inicio
    cargarSucursales();

    if (btnGuardarNuevo) {
        btnGuardarNuevo.addEventListener('click', async () => {
            const nombre = document.getElementById('addNombre').value.trim();
            const direccion = document.getElementById('addDireccion').value.trim();
            const telefono = document.getElementById('addTelefono').value.trim();
            const estado = document.getElementById('addEstado').value;

            if (nombre === "" || direccion === "" || telefono === "") {
                alert("Por favor, completa todos los campos.");
                return;
            }

            try {
                const respuesta = await fetch(API_URL, {
                    method: 'POST',
                    headers: window.getAuthHeaders(),
                    body: JSON.stringify({ nombre, direccion, telefono, estado })
                });

                if (respuesta.ok) {
                    formAgregar.reset();
                    const modalElement = document.getElementById('modalAgregar');
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    modalInstance.hide();
                    cargarSucursales();
                } else {
                    alert('Error al guardar la sucursal');
                }
            } catch (error) {
                console.error('Error al guardar sucursal:', error);
            }
        });
    }

    tablaSucursales.addEventListener('click', async (event) => {

        //Editar Sucursal
        if (event.target.classList.contains('btn-editar')) {
            const filaEnEdicion = event.target.closest('tr');
            idEnEdicion = event.target.getAttribute('data-id');

            const celdas = filaEnEdicion.querySelectorAll('td');

            const nombreActual = celdas[1].innerText;
            const direccionActual = celdas[2].innerText;
            const telefonoActual = celdas[3].innerText;
            const estadoActual = celdas[4].innerText.trim();

            document.getElementById('editNombre').value = nombreActual;
            document.getElementById('editDireccion').value = direccionActual;
            document.getElementById('editTelefono').value = telefonoActual;
            document.getElementById('editEstado').value = estadoActual;
        }

        // Eliminar Sucursal
        if (event.target.classList.contains('btn-eliminar')) {
            const idEliminar = event.target.getAttribute('data-id');
            if (confirm('¿Estás seguro de que deseas eliminar esta sucursal?')) {
                try {
                    const respuesta = await fetch(`${API_URL}/${idEliminar}`, {
                        method: 'DELETE',
                        headers: window.getAuthHeaders()
                    });

                    if (respuesta.ok) {
                        cargarSucursales();
                    } else {
                        alert('Error al eliminar la sucursal');
                    }
                } catch (error) {
                    console.error('Error al eliminar sucursal:', error);
                }
            }
        }
    });

    if (btnGuardarEdicion) {
        btnGuardarEdicion.addEventListener('click', async () => {
            if (idEnEdicion) {
                const nombre = document.getElementById('editNombre').value.trim();
                const direccion = document.getElementById('editDireccion').value.trim();
                const telefono = document.getElementById('editTelefono').value.trim();
                const estado = document.getElementById('editEstado').value;

                if (nombre === "" || direccion === "" || telefono === "") {
                    alert("Por favor, completa todos los campos de edición.");
                    return;
                }

                try {
                    const respuesta = await fetch(`${API_URL}/${idEnEdicion}`, {
                        method: 'PUT',
                        headers: window.getAuthHeaders(),
                        body: JSON.stringify({ nombre, direccion, telefono, estado })
                    });

                    if (respuesta.ok) {
                        const modalElement = document.getElementById('modalEditar');
                        const modalInstance = bootstrap.Modal.getInstance(modalElement);
                        modalInstance.hide();

                        idEnEdicion = null;
                        cargarSucursales();
                    } else {
                        alert('Error al actualizar la sucursal');
                    }
                } catch (error) {
                    console.error('Error al actualizar sucursal:', error);
                }
            }
        });
    }
});

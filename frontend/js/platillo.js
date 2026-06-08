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

    // Función auxiliar para convertir archivo a Base64
    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    // Función para cargar los platillos desde la base de datos
    const cargarPlatillos = async () => {
        try {
            const respuesta = await fetch(API_URL, { headers: window.getAuthHeaders() });
            const platillos = await respuesta.json();

            const userRole = localStorage.getItem('userRole') || 'empleado';
            
            // Ocultar botón de agregar si no es admin
            const btnAgregar = document.getElementById('btnAgregar');
            if (btnAgregar && userRole !== 'admin') {
                btnAgregar.style.display = 'none';
            }

            // Ocultar cabeceras de tabla si no es admin
            const tableHeaders = document.querySelectorAll('thead th');
            if (userRole !== 'admin' && tableHeaders.length >= 7) {
                tableHeaders[5].style.display = 'none'; // Menú del Día
                tableHeaders[6].style.display = 'none'; // Acciones
            }

            tablaPlatillos.innerHTML = '';

            platillos.forEach((platillo, index) => {
                const badgeClass = platillo.estado === "Disponible" ? "bg-success" : "bg-danger";
                
                // Verificar si está agotado en la sucursal actual
                const userSucursal = localStorage.getItem('userSucursal');
                const estaAgotadoLocal = userSucursal && platillo.sucursalesAgotado && platillo.sucursalesAgotado.some(suc => suc._id === userSucursal || suc === userSucursal);
                const btnAgotadoText = estaAgotadoLocal ? 'Reactivar' : 'Agotar';
                const btnAgotadoClass = estaAgotadoLocal ? 'btn-success' : 'btn-secondary';
                
                // Mostrar sucursales donde está agotado (para admins o info general)
                let agotadoEnHTML = '';
                if (platillo.sucursalesAgotado && platillo.sucursalesAgotado.length > 0) {
                    const nombresAgotados = platillo.sucursalesAgotado.map(s => s.nombre || 'Desconocida').join(', ');
                    agotadoEnHTML = `<div class="mt-1" style="font-size: 0.75rem; color: #dc3545;">Agotado en:<br><strong>${nombresAgotados}</strong></div>`;
                }

                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${platillo.nombre}</td>
                    <td>${platillo.receta}</td>
                    <td>$${platillo.precio}</td>
                    <td><span class="badge ${badgeClass}">${platillo.estado}</span></td>
                    <td>
                        <button class="btn ${btnAgotadoClass} btn-sm btn-agotar" data-id="${platillo._id}">${btnAgotadoText}</button>
                        ${agotadoEnHTML}
                    </td>
                    ${userRole === 'admin' ? `
                    <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input switch-menu" type="checkbox" data-id="${platillo._id}" ${platillo.esMenuDelDia ? 'checked' : ''}>
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-warning btn-sm btn-editar" data-id="${platillo._id}" data-imagen="${platillo.imagen || ''}" data-bs-toggle="modal" data-bs-target="#modalEditar">Editar</button>
                        <button class="btn btn-danger btn-sm btn-eliminar" data-id="${platillo._id}">Eliminar</button>
                    </td>` : ''}
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
            
            const fileInput = document.getElementById('addImagen');
            let imagen = '';
            if (fileInput.files.length > 0) {
                try {
                    imagen = await toBase64(fileInput.files[0]);
                } catch (e) {
                    console.error("Error al leer la imagen", e);
                }
            }

            if (nombre === "" || receta === "" || precio === "") {
                alert("Por favor, completa todos los campos.");
                return;
            }

            try {
                const respuesta = await fetch(API_URL, {
                    method: 'POST',
                    headers: window.getAuthHeaders(),
                    body: JSON.stringify({ nombre, receta, precio, estado, imagen })
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
            const imagenActual = event.target.getAttribute('data-imagen');

            document.getElementById('editNombre').value = nombreActual;
            document.getElementById('editReceta').value = recetaActual;
            document.getElementById('editPrecio').value = precioActual;
            document.getElementById('editEstado').value = estadoActual;
            
            const editImagenInput = document.getElementById('editImagen');
            editImagenInput.value = ''; // Limpiar selección previa
            editImagenInput.setAttribute('data-old-imagen', imagenActual || '');
        }

        // Elimina el Platillo
        if (event.target.classList.contains('btn-eliminar')) {
            const idEliminar = event.target.getAttribute('data-id');
            if (confirm('¿Estás seguro de que deseas eliminar este platillo?')) {
                try {
                    const respuesta = await fetch(`${API_URL}/${idEliminar}`, {
                        method: 'DELETE',
                        headers: window.getAuthHeaders()
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

        // Toggle Menu Del Dia
        if (event.target.classList.contains('switch-menu')) {
            const idToToggle = event.target.getAttribute('data-id');
            const isChecked = event.target.checked;
            const fila = event.target.closest('tr');
            
            // Obtenemos los valores actuales de la fila para no sobreescribir el resto con undefined
            const celdas = fila.querySelectorAll('td');
            const nombre = celdas[1].innerText;
            const receta = celdas[2].innerText;
            const precio = parseFloat(celdas[3].innerText.replace('$', '').trim());
            const estado = celdas[4].innerText.trim();

            try {
                const respuesta = await fetch(`${API_URL}/${idToToggle}`, {
                    method: 'PUT',
                    headers: window.getAuthHeaders(),
                    body: JSON.stringify({ nombre, receta, precio, estado, esMenuDelDia: isChecked })
                });

                if (!respuesta.ok) {
                    alert('Error al actualizar el Menú del Día');
                    event.target.checked = !isChecked; // revertir
                }
            } catch (error) {
                console.error('Error:', error);
                event.target.checked = !isChecked; // revertir
            }
        }

        // Agotar en Sucursal
        if (event.target.classList.contains('btn-agotar')) {
            const idToToggle = event.target.getAttribute('data-id');
            try {
                const respuesta = await fetch(`${API_URL}/${idToToggle}/agotado`, {
                    method: 'PUT',
                    headers: window.getAuthHeaders()
                });

                if (respuesta.ok) {
                    cargarPlatillos();
                } else {
                    const errData = await respuesta.json();
                    if (errData.message === 'Se requiere especificar una sucursal') {
                        // Es Administrador sin sucursal asignada. Abrir Modal de selección
                        document.getElementById('platilloIdAgotar').value = idToToggle;
                        cargarSucursalesAdmin();
                        const modalAdmin = new bootstrap.Modal(document.getElementById('modalAgotarAdmin'));
                        modalAdmin.show();
                    } else {
                        alert(errData.message || 'Error al cambiar estado de agotado');
                    }
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    });

    // Lógica del botón de Confirmar en el Modal de Admin
    const btnConfirmarAgotar = document.getElementById('btnConfirmarAgotar');
    if (btnConfirmarAgotar) {
        btnConfirmarAgotar.addEventListener('click', async () => {
            const idToToggle = document.getElementById('platilloIdAgotar').value;
            const sucursalSelect = document.getElementById('adminSucursalAgotarSelect').value;

            if (!sucursalSelect) {
                alert("Selecciona una sucursal");
                return;
            }

            try {
                const respuesta = await fetch(`${API_URL}/${idToToggle}/agotado`, {
                    method: 'PUT',
                    headers: window.getAuthHeaders(),
                    body: JSON.stringify({ sucursal: sucursalSelect })
                });

                if (respuesta.ok) {
                    const modalElement = document.getElementById('modalAgotarAdmin');
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    modalInstance.hide();
                    cargarPlatillos();
                } else {
                    const errData = await respuesta.json();
                    alert(errData.message || 'Error al cambiar estado de agotado');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }

    async function cargarSucursalesAdmin() {
        try {
            const res = await fetch('/api/sucursales', { headers: window.getAuthHeaders() });
            const sucursales = await res.json();
            const select = document.getElementById('adminSucursalAgotarSelect');
            select.innerHTML = '<option value="">-- Selecciona una Sucursal --</option>';
            sucursales.forEach(suc => {
                select.innerHTML += `<option value="${suc._id}">${suc.nombre}</option>`;
            });
        } catch (error) {
            console.error("Error al cargar sucursales", error);
        }
    }

    if (btnGuardarEdicion) {
        btnGuardarEdicion.addEventListener('click', async () => {
            if (idEnEdicion) {
                const nombre = document.getElementById('editNombre').value.trim();
                const receta = document.getElementById('editReceta').value.trim();
                const precio = document.getElementById('editPrecio').value.trim();
                const estado = document.getElementById('editEstado').value;
                
                const fileInput = document.getElementById('editImagen');
                let imagen = fileInput.getAttribute('data-old-imagen') || '';
                
                if (fileInput.files.length > 0) {
                    try {
                        imagen = await toBase64(fileInput.files[0]);
                    } catch (e) {
                        console.error("Error al leer la imagen", e);
                    }
                }

                if (nombre === "" || receta === "" || precio === "") {
                    alert("Por favor, completa todos los campos de edición.");
                    return;
                }

                try {
                    const respuesta = await fetch(`${API_URL}/${idEnEdicion}`, {
                        method: 'PUT',
                        headers: window.getAuthHeaders(),
                        body: JSON.stringify({ nombre, receta, precio, estado, imagen })
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
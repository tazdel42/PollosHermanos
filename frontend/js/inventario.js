document.addEventListener('DOMContentLoaded', () => {
    
    const formInventario = document.getElementById('formInventario');
    const tablaInventario = document.getElementById('tablaInventario');
    const formEditarCantidad = document.getElementById('formEditarCantidad');
    let modalEditarCantidadInstance;
    
    // Inicializar el modal de edición
    const modalEditarElement = document.getElementById('modalEditarCantidad');
    if (modalEditarElement) {
        modalEditarCantidadInstance = new bootstrap.Modal(modalEditarElement);
    }
    
    const userRole = localStorage.getItem('userRole') || 'empleado';
    const btnAgregar = document.getElementById('btnAgregar');
    
    if (btnAgregar && userRole !== 'admin') {
        btnAgregar.style.display = 'none';
    }

    const API_URL = '/api/inventory';

    // Función para obtener las credenciales (Token)
    function getAuthHeaders() {
        const token = localStorage.getItem('token');
        if (!token) window.location.href = 'index.html';
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    // Cargar inventario desde la base de datos
    const cargarInventario = async () => {
        try {
            const respuesta = await fetch(API_URL, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            const items = await respuesta.json();
            
            tablaInventario.innerHTML = '';
            
            items.forEach(item => {
                const idCorto = `#${item._id.substring(item._id.length - 4)}`;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${idCorto}</strong></td>
                    <td>${item.nombre}</td>
                    <td><span class="badge bg-secondary">${item.tipo}</span></td>
                    <td>${item.cantidad}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary btn-editar me-1" data-id="${item._id}" data-cantidad="${item.cantidad}">Editar</button>
                        ${userRole === 'admin' ? `<button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${item._id}">Eliminar</button>` : ''}
                    </td>
                `;
                tablaInventario.appendChild(tr);
            });
        } catch (error) {
            console.error('Error al cargar inventario:', error);
        }
    };

    cargarInventario();

    // Guardar un nuevo artículo
    formInventario.addEventListener('submit', async function(event) {
        event.preventDefault(); 

        const nombre = document.getElementById('nombreArticulo').value;
        const tipo = document.getElementById('tipoArticulo').value;
        const cantidad = document.getElementById('cantidadArticulo').value;

        try {
            const respuesta = await fetch(API_URL, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ nombre, tipo, cantidad })
            });

            if (respuesta.ok) {
                formInventario.reset();
                const modalElement = document.getElementById('modalNuevoArticulo');
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                modalInstance.hide();
                cargarInventario();
            } else {
                alert('Error al guardar el artículo. Asegúrate de ser administrador.');
            }
        } catch (error) {
            console.error('Error al guardar artículo:', error);
        }
    });

    // Guardar actualización de cantidad
    if (formEditarCantidad) {
        formEditarCantidad.addEventListener('submit', async function(event) {
            event.preventDefault();

            const idEditar = document.getElementById('editarArticuloId').value;
            const nuevaCantidad = document.getElementById('nuevaCantidadArticulo').value;

            try {
                const respuesta = await fetch(`${API_URL}/${idEditar}`, {
                    method: 'PUT',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ cantidad: Number(nuevaCantidad) })
                });

                if (respuesta.ok) {
                    if (modalEditarCantidadInstance) modalEditarCantidadInstance.hide();
                    cargarInventario();
                } else {
                    alert('Error al actualizar la cantidad.');
                }
            } catch (error) {
                console.error('Error al actualizar:', error);
            }
        });
    }

    // Delegación de eventos para Editar y Eliminar
    tablaInventario.addEventListener('click', async (event) => {
        // Eliminar
        if (event.target.classList.contains('btn-eliminar')) {
            const idEliminar = event.target.getAttribute('data-id');
            if (confirm('¿Estás seguro de que deseas eliminar este artículo?')) {
                try {
                    const respuesta = await fetch(`${API_URL}/${idEliminar}`, {
                        method: 'DELETE',
                        headers: getAuthHeaders()
                    });

                    if (respuesta.ok) {
                        cargarInventario();
                    } else {
                        alert('Error al eliminar el artículo.');
                    }
                } catch (error) {
                    console.error('Error al eliminar:', error);
                }
            }
        }

        // Editar (Sólo actualiza la cantidad como dicta el backend)
        if (event.target.classList.contains('btn-editar')) {
            const idEditar = event.target.getAttribute('data-id');
            const cantidadActual = event.target.getAttribute('data-cantidad');
            
            // Llenar el formulario del modal
            document.getElementById('editarArticuloId').value = idEditar;
            document.getElementById('nuevaCantidadArticulo').value = cantidadActual;
            
            // Mostrar el modal
            if (modalEditarCantidadInstance) {
                modalEditarCantidadInstance.show();
            }
        }
    });

});
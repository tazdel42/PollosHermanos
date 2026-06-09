document.addEventListener('DOMContentLoaded', () => {

    const tablaPedidos = document.getElementById('tablaPedidos');
    const selectProveedor = document.getElementById('addProveedor');

    //Variables para Agregar
    const btnGuardarNuevo = document.getElementById('btnGuardarNuevo');
    const formAgregar = document.getElementById('formAgregar');

    //Variables para Editar
    const btnGuardarEdicion = document.getElementById('btnGuardarEdicion');
    let idEnEdicion = null;

    //URLs del API
    const API_URL_PEDIDOS = '/api/pedidos';
    const API_URL_PROVEEDORES = '/api/proveedores';

    //Función para obtener las credenciales
    function getAuthHeaders() {
        const token = localStorage.getItem('token');
        if (!token) window.location.href = 'index.html';
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    //Función para cargar proveedores en el select
    const cargarProveedores = async () => {
        try {
            const respuesta = await fetch(API_URL_PROVEEDORES, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            const proveedores = await respuesta.json();

            selectProveedor.innerHTML = '';

            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Seleccione un proveedor...';
            selectProveedor.appendChild(defaultOption);

            proveedores.forEach(prov => {
                const option = document.createElement('option');
                option.value = prov._id;
                option.textContent = prov.nombre;
                selectProveedor.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar proveedores:', error);
        }
    };

    //Función para formatear fecha
    const formatearFecha = (fechaISO) => {
        const date = new Date(fechaISO);
        return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    //Función para cargar los pedidos
    const cargarPedidos = async () => {
        try {
            const respuesta = await fetch(API_URL_PEDIDOS, {
                method: 'GET',
                headers: getAuthHeaders()
            });
            const pedidos = await respuesta.json();

            tablaPedidos.innerHTML = '';

            pedidos.forEach(pedido => {
                let badgeClass = "bg-secondary";
                if (pedido.estado === "Entregado") badgeClass = "bg-success";
                if (pedido.estado === "Cancelado") badgeClass = "bg-danger";

                const nombreProveedor = pedido.proveedor ? pedido.proveedor.nombre : 'Proveedor Desconocido';

                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${formatearFecha(pedido.createdAt)}</td>
                    <td>${nombreProveedor}</td>
                    <td>${pedido.descripcionProductos}</td>
                    <td>$${pedido.total}</td>
                    <td><span class="badge ${badgeClass}">${pedido.estado}</span></td>
                    <td>
                        <button class="btn btn-warning btn-sm btn-editar" data-id="${pedido._id}" data-estado="${pedido.estado}" data-bs-toggle="modal" data-bs-target="#modalEditar">Actualizar Estado</button>
                        <button class="btn btn-danger btn-sm btn-eliminar" data-id="${pedido._id}">Eliminar</button>
                    </td>
                `;
                tablaPedidos.appendChild(fila);
            });
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
        }
    };

    //Llamar a cargar al inicio
    cargarProveedores();
    cargarPedidos();

    if (btnGuardarNuevo) {
        btnGuardarNuevo.addEventListener('click', async () => {
            const proveedor = selectProveedor.value;
            const descripcionProductos = document.getElementById('addProductos').value.trim();
            const total = document.getElementById('addTotal').value.trim();
            const estado = document.getElementById('addEstado').value;

            if (proveedor === "" || descripcionProductos === "" || total === "") {
                alert("Por favor, completa todos los campos.");
                return;
            }

            try {
                const respuesta = await fetch(API_URL_PEDIDOS, {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({ proveedor, descripcionProductos, total, estado })
                });

                if (respuesta.ok) {
                    formAgregar.reset();
                    const modalElement = document.getElementById('modalAgregar');
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    modalInstance.hide();
                    cargarPedidos();
                } else {
                    alert('Error al guardar el pedido');
                }
            } catch (error) {
                console.error('Error al guardar pedido:', error);
            }
        });
    }

    tablaPedidos.addEventListener('click', async (event) => {

        //Editar Estado
        if (event.target.classList.contains('btn-editar')) {
            idEnEdicion = event.target.getAttribute('data-id');
            const estadoActual = event.target.getAttribute('data-estado');
            document.getElementById('editEstado').value = estadoActual;
        }

        //Eliminar
        if (event.target.classList.contains('btn-eliminar')) {
            const idEliminar = event.target.getAttribute('data-id');
            if (confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
                try {
                    const respuesta = await fetch(`${API_URL_PEDIDOS}/${idEliminar}`, {
                        method: 'DELETE',
                        headers: getAuthHeaders()
                    });

                    if (respuesta.ok) {
                        cargarPedidos();
                    } else {
                        alert('Error al eliminar el pedido');
                    }
                } catch (error) {
                    console.error('Error al eliminar pedido:', error);
                }
            }
        }
    });

    if (btnGuardarEdicion) {
        btnGuardarEdicion.addEventListener('click', async () => {
            if (idEnEdicion) {
                const estado = document.getElementById('editEstado').value;

                try {
                    const respuesta = await fetch(`${API_URL_PEDIDOS}/${idEnEdicion}`, {
                        method: 'PUT',
                        headers: getAuthHeaders(),
                        body: JSON.stringify({ estado })
                    });

                    if (respuesta.ok) {
                        const modalElement = document.getElementById('modalEditar');
                        const modalInstance = bootstrap.Modal.getInstance(modalElement);
                        modalInstance.hide();

                        idEnEdicion = null;
                        cargarPedidos();
                    } else {
                        alert('Error al actualizar el pedido');
                    }
                } catch (error) {
                    console.error('Error al actualizar pedido:', error);
                }
            }
        });
    }
});

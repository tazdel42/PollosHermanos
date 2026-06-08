document.addEventListener('DOMContentLoaded', () => {
    // Al cargar la página, se muestran los datos si el token es válido y tiene los permisos.
    cargarProveedores();
});

// Función para obtener las credenciales actuales
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html'; // Si no hay token, enviar al login
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Interceptar errores de autorización (401 o 403)
function manejarErrorPermisos(res) {
    if (res.status === 401 || res.status === 403) {
        alert("Acceso denegado: Esta página es exclusiva para Administradores con Permisos Completos.");
        window.location.href = 'PaginaInicial.html';
        return true;
    }
    return false;
}

// GET - Cargar Proveedores
async function cargarProveedores() {
    try {
        const res = await fetch('/api/proveedores', {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (manejarErrorPermisos(res)) return;

        const proveedores = await res.json();
        const tabla = document.getElementById('tablaProveedores');
        tabla.innerHTML = '';

        proveedores.forEach(prov => {
            const tr = document.createElement('tr');
            // Agregamos la columna folios y el botón Editar
            tr.innerHTML = `
                <td>${prov._id.slice(-5).toUpperCase()}</td>
                <td><strong>${prov.nombre}</strong></td>
                <td><span class="badge bg-secondary">${prov.folios || 'N/A'}</span></td>
                <td>${prov.descripcion}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick='abrirModalEditar(${JSON.stringify(prov)})'>Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarProveedor('${prov._id}')">Eliminar</button>
                </td>
            `;
            tabla.appendChild(tr);
        });
    } catch (error) {
        console.error("Error cargando datos: ", error);
    }
}

// POST - Agregar Proveedor
async function agregarProveedor() {
    const nombre = document.getElementById('nombreProveedor').value.trim();
    const folios = document.getElementById('foliosProveedor').value.trim();
    const descripcion = document.getElementById('descProveedor').value.trim();

    if (!nombre || !descripcion || !folios) {
        alert("Llena todos los campos.");
        return;
    }

    try {
        const res = await fetch('/api/proveedores', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ nombre, descripcion, folios })
        });

        if (manejarErrorPermisos(res)) return;

        if (res.ok) {
            document.getElementById('formProveedor').reset();
            const modalElement = document.getElementById('modalNuevoProveedor');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
            cargarProveedores();
        } else {
            const err = await res.json();
            alert("Error: " + err.message);
        }
    } catch (error) {
        console.error("Error al agregar proveedor: ", error);
    }
}

// ABRIR MODAL EDITAR - Cargar datos existentes en el form
function abrirModalEditar(prov) {
    document.getElementById('editIdProveedor').value = prov._id;
    document.getElementById('editNombreProveedor').value = prov.nombre;
    document.getElementById('editFoliosProveedor').value = prov.folios || '';
    document.getElementById('editDescProveedor').value = prov.descripcion;

    const modalElement = document.getElementById('modalEditarProveedor');
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
}

// PUT - Guardar Edición
async function guardarEdicionProveedor() {
    const id = document.getElementById('editIdProveedor').value;
    const nombre = document.getElementById('editNombreProveedor').value.trim();
    const folios = document.getElementById('editFoliosProveedor').value.trim();
    const descripcion = document.getElementById('editDescProveedor').value.trim();

    if (!nombre || !descripcion || !folios) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    try {
        const res = await fetch(`/api/proveedores/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ nombre, descripcion, folios })
        });

        if (manejarErrorPermisos(res)) return;

        if (res.ok) {
            const modalElement = document.getElementById('modalEditarProveedor');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
            cargarProveedores(); // Refrescamos la tabla
        } else {
            const err = await res.json();
            alert("Error al actualizar: " + err.message);
        }
    } catch (error) {
        console.error("Error al editar proveedor: ", error);
    }
}

// DELETE - Eliminar Proveedor
async function eliminarProveedor(id) {
    if (!confirm("¿Seguro que deseas eliminar a este proveedor de la base de datos?")) return;

    try {
        const res = await fetch(`/api/proveedores/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (manejarErrorPermisos(res)) return;

        if (res.ok) {
            cargarProveedores();
        }
    } catch (error) {
        console.error("Error al eliminar proveedor:", error);
    }
}
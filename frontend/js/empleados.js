let empleadoModal;
let usuarioModal;
let asistenciaModal;

document.addEventListener('DOMContentLoaded', () => {
    empleadoModal = new bootstrap.Modal(document.getElementById('empleadoModal'));
    usuarioModal = new bootstrap.Modal(document.getElementById('usuarioModal'));

    cargarEmpleados();
    cargarUsuarios();
    cargarSucursales();
});


async function cargarSucursales() {
    try {
        const res = await fetch('/api/sucursales', { headers: window.getAuthHeaders() });
        const sucursales = await res.json();
        const selectSucursal = document.getElementById('sucursalEmpleado');
        if (!selectSucursal) return;

        selectSucursal.innerHTML = '<option value="">-- Selecciona una Sucursal --</option>';
        sucursales.forEach(suc => {
            const option = document.createElement('option');
            option.value = suc._id;
            option.textContent = suc.nombre;
            selectSucursal.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar sucursales:', error);
    }
}

async function cargarEmpleados() {
    try {
        const res = await fetch('/api/employees', { headers: window.getAuthHeaders() });
        const empleados = await res.json();
        const tabla = document.getElementById('tablaEmpleados');
        
        tabla.innerHTML = '';

        empleados.forEach(emp => {
            const tr = document.createElement('tr');
            const nombreSucursal = emp.sucursal ? emp.sucursal.nombre : 'Global';
            tr.innerHTML = `
                <td>${emp.noEmpleado}</td>
                <td>${emp.nombre}</td>
                <td><span class="badge bg-info">${nombreSucursal}</span></td>
                <td>${emp.rol || 'N/A'}</td>
                <td>${emp.telefono}</td>
                <td>${emp.correo}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick='abrirModalEmpleado(${JSON.stringify(emp)})'>Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarEmpleado('${emp._id}')">Baja</button>
                </td>
            `;
            tabla.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar empleados:', error);
    }
}

function altaEmpleado() {
    document.getElementById('empleadoForm').reset();
    document.getElementById('empleadoId').value = '';
    document.getElementById('empleadoModalLabel').innerText = 'Nuevo Empleado';
    empleadoModal.show();
}

function abrirModalEmpleado(emp) {
    document.getElementById('empleadoId').value = emp._id;
    document.getElementById('noEmpleado').value = emp.noEmpleado;
    document.getElementById('nombre').value = emp.nombre;
    document.getElementById('sucursalEmpleado').value = emp.sucursal ? (emp.sucursal._id || emp.sucursal) : '';
    document.getElementById('rol').value = emp.rol || 'empleado';
    document.getElementById('telefono').value = emp.telefono;
    document.getElementById('correo').value = emp.correo;

    document.getElementById('empleadoModalLabel').innerText = 'Editar Empleado';
    empleadoModal.show();
}

async function guardarEmpleado() {
    const id = document.getElementById('empleadoId').value;
    const noEmpleado = document.getElementById('noEmpleado').value;
    const nombre = document.getElementById('nombre').value;
    const sucursal = document.getElementById('sucursalEmpleado').value;
    const rol = document.getElementById('rol').value;
    const telefono = document.getElementById('telefono').value;
    const correo = document.getElementById('correo').value;

    const payload = { noEmpleado, nombre, sucursal, rol, telefono, correo };

    try {
        let res;
        const headers = window.getAuthHeaders();
        if (id) {
            res = await fetch(`/api/employees/${id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch('/api/employees', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });
        }

        if (res.ok) {
            empleadoModal.hide();
            cargarEmpleados();
        } else {
            const error = await res.json();
            alert("Error: " + (error.message || 'Desconocido'));
        }
    } catch (error) {
        alert('Hubo un error al guardar el empleado.');
    }
}

async function eliminarEmpleado(id) {
    if (confirm("¿Estás seguro de que quieres dar de baja a este empleado?")) {
        await fetch(`/api/employees/${id}`, { method: 'DELETE', headers: window.getAuthHeaders() });
        cargarEmpleados();
    }
}

async function cargarUsuarios() {
    try {
        const res = await fetch('/api/employees/users/list', { headers: window.getAuthHeaders() });
        const usuarios = await res.json();
        const tabla = document.getElementById('tablaUsuarios');
        tabla.innerHTML = '';

        usuarios.forEach(user => {
            const tr = document.createElement('tr');
            const noEmp = user.noEmpleado || 'N/A';
            const badgeClass = user.estado === 'Activo' ? 'bg-success' : 'bg-secondary';

            tr.innerHTML = `
                <td>${noEmp}</td>
                <td>${user.correo}</td>
                <td>${user.rol}</td>
                <td>${user.permisos || 'Básico'}</td>
                <td><span class="badge ${badgeClass}">${user.estado || 'Activo'}</span></td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick='abrirModalUsuario(${JSON.stringify(user)})'>Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarUsuario('${user._id}')">Eliminar</button>
                </td>
            `;
            tabla.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
}

function altaUsuario() {
    window.location.href = 'registro.html';
}

function abrirModalUsuario(user) {
    document.getElementById('usuarioId').value = user._id;
    document.getElementById('usuarioRol').value = user.rol || 'empleado';
    document.getElementById('usuarioPermisos').value = user.permisos || 'Básico';
    document.getElementById('usuarioEstado').value = user.estado || 'Activo';
    usuarioModal.show();
}

async function guardarUsuario() {
    const id = document.getElementById('usuarioId').value;
    const rol = document.getElementById('usuarioRol').value;
    const permisos = document.getElementById('usuarioPermisos').value;
    const estado = document.getElementById('usuarioEstado').value;

    const payload = { rol, permisos, estado };

    try {
        const res = await fetch(`/api/employees/users/${id}`, {
            method: 'PUT',
            headers: window.getAuthHeaders(),
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            usuarioModal.hide();
            cargarUsuarios();
        } else {
            alert("Error al actualizar usuario");
        }
    } catch (error) {
        alert('Hubo un error al guardar el usuario.');
    }
}

async function eliminarUsuario(id) {
    if (confirm("¿Seguro que quieres eliminar este usuario?")) {
        await fetch(`/api/employees/users/${id}`, { method: 'DELETE', headers: window.getAuthHeaders() });
        cargarUsuarios();
    }
}

// Fin de empleados.js

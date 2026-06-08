let empleadoModal;
let usuarioModal;
let asistenciaModal;

document.addEventListener('DOMContentLoaded', () => {
    empleadoModal = new bootstrap.Modal(document.getElementById('empleadoModal'));
    usuarioModal = new bootstrap.Modal(document.getElementById('usuarioModal'));
    asistenciaModal = new bootstrap.Modal(document.getElementById('asistenciaModal'));

    cargarEmpleados();
    cargarUsuarios();
    cargarAsistencias();


    const entrada = document.getElementById('asistenciaEntrada');
    const salida = document.getElementById('asistenciaSalida');
    
    function calcularHoras() {
        if (entrada.value && salida.value) {
            const [hE, mE] = entrada.value.split(':').map(Number);
            const [hS, mS] = salida.value.split(':').map(Number);
            
            let horas = hS - hE;
            let mins = mS - mE;
            
            if (mins < 0) {
                horas--;
                mins += 60;
            }
            
            if (horas < 0) {
                horas += 24;
            }
            
            const total = horas + (mins / 60);
            document.getElementById('asistenciaHoras').value = total.toFixed(2);
        }
    }

    entrada.addEventListener('change', calcularHoras);
    salida.addEventListener('change', calcularHoras);
});


async function cargarEmpleados() {
    try {
        const res = await fetch('/api/employees');
        const empleados = await res.json();
        const tabla = document.getElementById('tablaEmpleados');
        const selectAsistencia = document.getElementById('asistenciaEmpleado');
        
        tabla.innerHTML = '';
        selectAsistencia.innerHTML = '<option value="">-- Selecciona un Empleado --</option>';

        empleados.forEach(emp => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${emp.noEmpleado}</td>
                <td>${emp.nombre}</td>
                <td>${emp.rol || 'N/A'}</td>
                <td>${emp.telefono}</td>
                <td>${emp.correo}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick='abrirModalEmpleado(${JSON.stringify(emp)})'>Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarEmpleado('${emp._id}')">Baja</button>
                </td>
            `;
            tabla.appendChild(tr);

            const option = document.createElement('option');
            option.value = emp._id;
            option.textContent = `${emp.noEmpleado} - ${emp.nombre}`;
            selectAsistencia.appendChild(option);
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
    const rol = document.getElementById('rol').value;
    const telefono = document.getElementById('telefono').value;
    const correo = document.getElementById('correo').value;

    const payload = { noEmpleado, nombre, rol, telefono, correo };

    try {
        let res;
        if (id) {
            res = await fetch(`/api/employees/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch('/api/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
        await fetch(`/api/employees/${id}`, { method: 'DELETE' });
        cargarEmpleados();
    }
}


async function cargarUsuarios() {
    try {
        const res = await fetch('/api/employees/users/list');
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
            headers: { 'Content-Type': 'application/json' },
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
        await fetch(`/api/employees/users/${id}`, { method: 'DELETE' });
        cargarUsuarios();
    }
}


async function cargarAsistencias() {
    try {
        const res = await fetch('/api/employees/attendances/list');
        const asistencias = await res.json();
        const tabla = document.getElementById('tablaControl');
        if (!tabla) return;
        tabla.innerHTML = '';

        asistencias.forEach(asis => {
            const tr = document.createElement('tr');
            const empNombre = asis.idEmpleado ? asis.idEmpleado.nombre : 'Desconocido';
            let badgeClass = 'bg-success';
            if (asis.estadoAsistencia === 'Ausente' || asis.estadoAsistencia === 'Falta Injustificada') badgeClass = 'bg-danger';
            if (asis.estadoAsistencia === 'Retardo') badgeClass = 'bg-warning text-dark';

            tr.innerHTML = `
                <td>${empNombre}</td>
                <td>${asis.fecha}</td>
                <td>${asis.horaEntrada || '-'}</td>
                <td>${asis.horaSalida || '-'}</td>
                <td>${asis.horasTrabajadas || 0}</td>
                <td>$${asis.salarioDia || 0}</td>
                <td><span class="badge ${badgeClass}">${asis.estadoAsistencia || 'Presente'}</span></td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick='abrirModalAsistencia(${JSON.stringify(asis)})'>Modificar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarAsistencia('${asis._id}')">Borrar</button>
                </td>
            `;
            tabla.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar asistencias:', error);
    }
}

function registrarAsistencia() {
    document.getElementById('asistenciaForm').reset();
    document.getElementById('asistenciaId').value = '';
    document.getElementById('asistenciaFecha').value = new Date().toISOString().split('T')[0];
    document.getElementById('asistenciaModalLabel').innerText = 'Registrar Asistencia';
    asistenciaModal.show();
}

function abrirModalAsistencia(asis) {
    document.getElementById('asistenciaId').value = asis._id;
    document.getElementById('asistenciaEmpleado').value = asis.idEmpleado ? asis.idEmpleado._id : '';
    document.getElementById('asistenciaFecha').value = asis.fecha;
    document.getElementById('asistenciaEntrada').value = asis.horaEntrada;
    document.getElementById('asistenciaSalida').value = asis.horaSalida;
    document.getElementById('asistenciaHoras').value = asis.horasTrabajadas;
    document.getElementById('asistenciaSalario').value = asis.salarioDia;
    document.getElementById('asistenciaEstado').value = asis.estadoAsistencia;

    document.getElementById('asistenciaModalLabel').innerText = 'Modificar Asistencia';
    asistenciaModal.show();
}

async function guardarAsistencia() {
    const id = document.getElementById('asistenciaId').value;
    const idEmpleado = document.getElementById('asistenciaEmpleado').value;
    const fecha = document.getElementById('asistenciaFecha').value;
    const horaEntrada = document.getElementById('asistenciaEntrada').value;
    const horaSalida = document.getElementById('asistenciaSalida').value;
    const horasTrabajadas = document.getElementById('asistenciaHoras').value;
    const salarioDia = document.getElementById('asistenciaSalario').value;
    const estadoAsistencia = document.getElementById('asistenciaEstado').value;

    const payload = { idEmpleado, fecha, horaEntrada, horaSalida, horasTrabajadas, salarioDia, estadoAsistencia };

    try {
        let res;
        if (id) {
            res = await fetch(`/api/employees/attendances/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch('/api/employees/attendances/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        if (res.ok) {
            asistenciaModal.hide();
            cargarAsistencias();
        } else {
            const error = await res.json();
            alert("Error: " + (error.message || 'Desconocido'));
        }
    } catch (error) {
        alert('Hubo un error al guardar la asistencia.');
    }
}

async function eliminarAsistencia(id) {
    if (confirm("¿Seguro que quieres eliminar este registro?")) {
        await fetch(`/api/employees/attendances/${id}`, { method: 'DELETE' });
        cargarAsistencias();
    }
}

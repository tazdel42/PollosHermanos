let asistenciaModal;

document.addEventListener('DOMContentLoaded', () => {
    asistenciaModal = new bootstrap.Modal(document.getElementById('asistenciaModal'));

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

    if (entrada && salida) {
        entrada.addEventListener('change', calcularHoras);
        salida.addEventListener('change', calcularHoras);
    }
});

async function cargarEmpleadosSelect() {
    try {
        const res = await fetch('/api/employees', { headers: window.getAuthHeaders() });
        const empleados = await res.json();
        const selectAsistencia = document.getElementById('asistenciaEmpleado');

        if (selectAsistencia) {
            selectAsistencia.innerHTML = '<option value="">-- Selecciona un Empleado --</option>';
            empleados.forEach(emp => {
                const option = document.createElement('option');
                option.value = emp._id;
                option.textContent = `${emp.noEmpleado} - ${emp.nombre}`;
                selectAsistencia.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar empleados:', error);
    }
}

async function cargarAsistencias() {
    try {
        const res = await fetch('/api/employees/attendances/list', { headers: window.getAuthHeaders() });
        const asistencias = await res.json();
        const tabla = document.getElementById('tablaControl');
        if (!tabla) return;
        tabla.innerHTML = '';

        const userRole = localStorage.getItem('userRole') || 'empleado';

        // Hide Admin elements
        if (userRole !== 'admin') {
            document.getElementById('divExportarAsistencias').style.display = 'none';
            document.getElementById('thAccionesAsistencia').style.display = 'none';
            document.getElementById('divAsistenciaEmpleado').style.display = 'none'; // Employee shouldn't pick who they are
        } else {
            cargarEmpleadosSelect();
        }

        asistencias.forEach(asis => {
            const tr = document.createElement('tr');
            const empNombre = asis.idEmpleado ? asis.idEmpleado.nombre : 'Desconocido';
            let badgeColor = 'success';
            if (asis.estadoAsistencia === 'Ausente' || asis.estadoAsistencia === 'Falta Injustificada') badgeColor = 'danger';
            if (asis.estadoAsistencia === 'Retardo') badgeColor = 'warning';

            tr.innerHTML = `
                <td>${empNombre}</td>
                <td>${asis.fecha}</td>
                <td>${asis.horaEntrada || '--:--'}</td>
                <td>${asis.horaSalida || '--:--'}</td>
                <td>${asis.horasTrabajadas || 0}</td>
                <td>$${asis.bonoDiario || 0}</td>
                <td>${asis.laborDia || ''}</td>
                <td><span class="badge bg-${badgeColor}">${asis.estadoAsistencia || 'Presente'}</span></td>
                ${userRole === 'admin' ? `
                <td>
                    <button class="btn btn-primary btn-sm" onclick='abrirModalAsistencia(${JSON.stringify(asis)})'>Modificar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarAsistencia('${asis._id}')">Borrar</button>
                </td>` : ''}
            `;
            tabla.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar asistencias:', error);
    }
}

async function registrarAsistencia() {
    const userRole = localStorage.getItem('userRole');
    document.getElementById('asistenciaForm').reset();
    document.getElementById('asistenciaId').value = '';
    document.getElementById('asistenciaFecha').value = new Date().toISOString().split('T')[0];
    document.getElementById('asistenciaModalLabel').innerText = 'Registrar Asistencia';

    if (userRole !== 'admin') {
        // Automatically set the employee ID for normal employees based on their logged in email
        try {
            const res = await fetch('/api/employees', { headers: window.getAuthHeaders() });
            const empleados = await res.json();
            const email = localStorage.getItem('userEmail');
            const emp = empleados.find(e => e.correo === email);
            if (emp) {
                // We add an option just for them to submit
                const select = document.getElementById('asistenciaEmpleado');
                select.innerHTML = `<option value="${emp._id}" selected>${emp.nombre}</option>`;
            }
        } catch (e) { console.log(e) }
    }

    asistenciaModal.show();
}

function abrirModalAsistencia(asis) {
    document.getElementById('asistenciaId').value = asis._id;
    document.getElementById('asistenciaEmpleado').value = asis.idEmpleado ? asis.idEmpleado._id : '';
    document.getElementById('asistenciaFecha').value = asis.fecha;
    document.getElementById('asistenciaEntrada').value = asis.horaEntrada;
    document.getElementById('asistenciaSalida').value = asis.horaSalida;
    document.getElementById('asistenciaHoras').value = asis.horasTrabajadas;
    document.getElementById('asistenciaBono').value = asis.bonoDiario;
    document.getElementById('asistenciaLabor').value = asis.laborDia;
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

    if (!idEmpleado || !fecha || !horaEntrada || !horaSalida) {
        alert("Por favor, rellena todos los campos obligatorios, incluyendo la hora de entrada y la de salida.");
        return;
    }

    const horasTrabajadas = parseFloat(document.getElementById('asistenciaHoras').value) || 0;
    const bonoDiario = parseFloat(document.getElementById('asistenciaBono').value) || 0;
    const laborDia = document.getElementById('asistenciaLabor').value;
    const estadoAsistencia = document.getElementById('asistenciaEstado').value;

    const payload = { idEmpleado, fecha, horaEntrada, horaSalida, horasTrabajadas, bonoDiario, laborDia, estadoAsistencia };

    try {
        let res;
        const headers = window.getAuthHeaders();
        if (id) {
            res = await fetch(`/api/employees/attendances/${id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(payload)
            });
        } else {
            res = await fetch('/api/employees/attendances/list', {
                method: 'POST',
                headers: headers,
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
        await fetch(`/api/employees/attendances/${id}`, { method: 'DELETE', headers: window.getAuthHeaders() });
        cargarAsistencias();
    }
}

// Funciones para Exportar Asistencias
window.exportarAsistenciasPDF = function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');

    doc.text("Reporte de Asistencias - Los Pollos Hermanos", 14, 15);
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 22);

    doc.autoTable({
        html: '#tablaControlHtml',
        startY: 28,
        theme: 'striped',
        columns: [
            { header: 'Empleado', dataKey: 0 },
            { header: 'Fecha', dataKey: 1 },
            { header: 'Entrada', dataKey: 2 },
            { header: 'Salida', dataKey: 3 },
            { header: 'Horas', dataKey: 4 },
            { header: 'Bono', dataKey: 5 },
            { header: 'Labor', dataKey: 6 },
            { header: 'Estado', dataKey: 7 }
        ],
        didParseCell: function (data) {
            if (data.column.index === 8) {
                data.cell.styles.cellWidth = 0;
                data.cell.styles.fontSize = 0;
                data.cell.styles.textColor = [255, 255, 255];
                data.cell.text = '';
            }
        }
    });

    doc.save("Reporte_Asistencias.pdf");
};

window.exportarAsistenciasExcel = function () {
    const tablaHtml = document.getElementById("tablaControlHtml");
    const wb = XLSX.utils.table_to_book(tablaHtml, { sheet: "Asistencias" });
    XLSX.writeFile(wb, "Reporte_Asistencias.xlsx");
};

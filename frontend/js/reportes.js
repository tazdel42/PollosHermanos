document.addEventListener('DOMContentLoaded', () => {

    const kpiBalance = document.getElementById('kpiBalance');
    const kpiEmpleados = document.getElementById('kpiEmpleados');
    const kpiInventario = document.getElementById('kpiInventario');
    const kpiPedidos = document.getElementById('kpiPedidos');

    const detalleIngresos = document.getElementById('detalleIngresos');
    const detalleEgresos = document.getElementById('detalleEgresos');
    const btnRefrescar = document.getElementById('btnRefrescar');

    const API_URL = '/api/reportes/global';

    const cargarReportes = async () => {
        try {
            //Muestra el estado de carga
            kpiBalance.innerText = '...';
            kpiEmpleados.innerText = '...';
            kpiInventario.innerText = '...';
            kpiPedidos.innerText = '...';

            const respuesta = await fetch(API_URL, { headers: window.getAuthHeaders() });
            if (!respuesta.ok) throw new Error("Error en red");

            const datos = await respuesta.json();

            //Llenar datos
            kpiBalance.innerText = `$${datos.finanzas.balance.toFixed(2)}`;
            detalleIngresos.innerText = `$${datos.finanzas.ingresos.toFixed(2)}`;
            detalleEgresos.innerText = `$${datos.finanzas.egresos.toFixed(2)}`;

            kpiEmpleados.innerText = datos.empleados.activos;
            kpiInventario.innerText = datos.inventario.criticos;
            kpiPedidos.innerText = datos.pedidos.pendientes;

        } catch (error) {
            console.error('Error al cargar reportes:', error);
            kpiBalance.innerText = 'Error';
            kpiEmpleados.innerText = 'Error';
            kpiInventario.innerText = 'Error';
            kpiPedidos.innerText = 'Error';
        }
    };

    const cargarAuditoria = async () => {
        try {
            const tbody = document.getElementById('tablaAuditoria');
            if (!tbody) return;

            const respuesta = await fetch('/api/auditoria', { headers: window.getAuthHeaders() });
            if (!respuesta.ok) throw new Error("Error obteniendo auditoría");
            const logs = await respuesta.json();

            tbody.innerHTML = '';
            if (logs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay registros de auditoría</td></tr>';
                return;
            }

            logs.forEach(log => {
                const tr = document.createElement('tr');
                const fecha = new Date(log.createdAt).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
                const usuario = log.usuario ? log.usuario.nombre : 'Desconocido';

                let badgeColor = 'secondary';
                if (log.accion === 'Crear') badgeColor = 'success';
                if (log.accion === 'Actualizar') badgeColor = 'warning';
                if (log.accion === 'Eliminar') badgeColor = 'danger';
                if (log.accion === 'Agotar') badgeColor = 'dark';

                tr.innerHTML = `
                    <td>${fecha}</td>
                    <td>${usuario}</td>
                    <td><strong>${log.modulo}</strong></td>
                    <td><span class="badge bg-${badgeColor}">${log.accion}</span></td>
                    <td>${log.descripcion}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (error) {
            console.error(error);
        }
    };

    cargarReportes();
    cargarAuditoria();

    if (btnRefrescar) {
        btnRefrescar.addEventListener('click', () => {
            cargarReportes();
            cargarAuditoria();
        });
    }
});

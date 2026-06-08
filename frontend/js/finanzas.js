document.addEventListener('DOMContentLoaded', () => {

    const tablaTransacciones = document.getElementById('tablaTransacciones');

    // Variables de resumen
    const resumenIngresos = document.getElementById('resumenIngresos');
    const resumenEgresos = document.getElementById('resumenEgresos');
    const resumenBalance = document.getElementById('resumenBalance');

    // Variables para Agregar
    const btnGuardarNuevo = document.getElementById('btnGuardarNuevo');
    const formAgregar = document.getElementById('formAgregar');

    // URL del API
    const API_URL = '/api/transacciones';

    // Función para formatear fecha
    const formatearFecha = (fechaISO) => {
        const date = new Date(fechaISO);
        return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Función para cargar transacciones
    const cargarTransacciones = async () => {
        try {
            const respuesta = await fetch(API_URL, { headers: window.getAuthHeaders() });
            const transacciones = await respuesta.json();

            tablaTransacciones.innerHTML = '';
            let totalIngresos = 0;
            let totalEgresos = 0;

            transacciones.forEach(trans => {
                let badgeClass = trans.tipo === "Ingreso" ? "bg-success" : "bg-danger";

                if (trans.tipo === "Ingreso") {
                    totalIngresos += trans.monto;
                } else {
                    totalEgresos += trans.monto;
                }

                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${formatearFecha(trans.fecha)}</td>
                    <td><span class="badge ${badgeClass}">${trans.tipo}</span></td>
                    <td>$${trans.monto.toFixed(2)}</td>
                    <td>${trans.descripcion}</td>
                    <td>
                        <button class="btn btn-danger btn-sm btn-eliminar" data-id="${trans._id}">Eliminar</button>
                    </td>
                `;
                tablaTransacciones.appendChild(fila);
            });

            // Actualizar resumen
            const balance = totalIngresos - totalEgresos;
            resumenIngresos.innerText = `$${totalIngresos.toFixed(2)}`;
            resumenEgresos.innerText = `$${totalEgresos.toFixed(2)}`;
            resumenBalance.innerText = `$${balance.toFixed(2)}`;

        } catch (error) {
            console.error('Error al cargar transacciones:', error);
        }
    };

    // Llamar a cargar al inicio
    cargarTransacciones();

    if (btnGuardarNuevo) {
        btnGuardarNuevo.addEventListener('click', async () => {
            const tipo = document.getElementById('addTipo').value;
            const monto = document.getElementById('addMonto').value.trim();
            const descripcion = document.getElementById('addDescripcion').value.trim();

            if (monto === "" || descripcion === "") {
                alert("Por favor, completa todos los campos.");
                return;
            }

            try {
                const respuesta = await fetch(API_URL, {
                    method: 'POST',
                    headers: window.getAuthHeaders(),
                    body: JSON.stringify({ tipo, monto, descripcion })
                });

                if (respuesta.ok) {
                    formAgregar.reset();
                    const modalElement = document.getElementById('modalAgregar');
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    modalInstance.hide();
                    cargarTransacciones();
                } else {
                    alert('Error al guardar la transacción');
                }
            } catch (error) {
                console.error('Error al guardar transacción:', error);
            }
        });
    }

    tablaTransacciones.addEventListener('click', async (event) => {
        // Eliminar Transacción
        if (event.target.classList.contains('btn-eliminar')) {
            const idEliminar = event.target.getAttribute('data-id');
            if (confirm('¿Estás seguro de que deseas eliminar este registro? Afectará el balance neto.')) {
                try {
                    const respuesta = await fetch(`${API_URL}/${idEliminar}`, {
                        method: 'DELETE',
                        headers: window.getAuthHeaders()
                    });

                    if (respuesta.ok) {
                        cargarTransacciones();
                    } else {
                        alert('Error al eliminar la transacción');
                    }
                } catch (error) {
                    console.error('Error al eliminar transacción:', error);
                }
            }
        }
    });

});

// Función para Exportar a PDF
window.exportarFinanzasPDF = function () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Reporte de Finanzas - Los Pollos Hermanos", 14, 15);
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 22);

    doc.autoTable({
        html: '#tablaFinanzasHtml',
        startY: 28,
        theme: 'striped',
        columns: [
            { header: 'Fecha', dataKey: 0 },
            { header: 'Tipo', dataKey: 1 },
            { header: 'Monto', dataKey: 2 },
            { header: 'Descripción', dataKey: 3 }
        ],
        didParseCell: function (data) {
            if (data.column.index === 4) {
                // Ignora columna Acciones
                data.cell.styles.cellWidth = 0;
                data.cell.styles.fontSize = 0;
                data.cell.styles.textColor = [255, 255, 255];
                data.cell.text = '';
            }
        }
    });

    doc.save("Reporte_Finanzas.pdf");
};

// Función para Exportar a Excel
window.exportarFinanzasExcel = function () {
    const tablaHtml = document.getElementById("tablaFinanzasHtml");
    const wb = XLSX.utils.table_to_book(tablaHtml, { sheet: "Finanzas" });
    XLSX.writeFile(wb, "Reporte_Finanzas.xlsx");
};

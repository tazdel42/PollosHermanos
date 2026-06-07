// Esperamos a que todo el HTML se cargue antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {
    
    // Obtenemos las referencias a los elementos que vamos a usar
    const formInventario = document.getElementById('formInventario');
    const tablaInventario = document.getElementById('tablaInventario');
    
    // Un contador simple para simular un ID de base de datos
    let contadorId = 1; 

    // Escuchamos el evento 'submit' (cuando se envía el formulario)
    formInventario.addEventListener('submit', function(event) {
        
        // Evitamos que la página se recargue (comportamiento por defecto)
        event.preventDefault(); 

        // 1. Extraer los valores ingresados por el usuario
        const nombre = document.getElementById('nombreArticulo').value;
        const tipo = document.getElementById('tipoArticulo').value;
        const cantidad = document.getElementById('cantidadArticulo').value;

        // 2. Formatear el ID (ej: #001, #002)
        const idFormateado = `#${contadorId.toString().padStart(3, '0')}`;

        // 3. Crear una nueva fila (<tr>) con el código HTML necesario
        const nuevaFila = document.createElement('tr');
        nuevaFila.innerHTML = `
            <td><strong>${idFormateado}</strong></td>
            <td>${nombre}</td>
            <td><span class="badge bg-secondary">${tipo}</span></td>
            <td>${cantidad}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1">Editar</button>
                <button class="btn btn-sm btn-outline-danger" onclick="this.closest('tr').remove()">Eliminar</button>
            </td>
        `;

        // 4. Agregar esa nueva fila a nuestra tabla
        tablaInventario.appendChild(nuevaFila);

        // 5. Incrementar el ID para el siguiente artículo
        contadorId++;

        // 6. Limpiar el formulario para la próxima vez
        formInventario.reset();

        // 7. Cerrar el Modal usando las herramientas de Bootstrap
        const modalElement = document.getElementById('modalNuevoArticulo');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
    });
});
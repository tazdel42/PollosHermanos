document.addEventListener('DOMContentLoaded', () => {
    cargarInventario();
    
    // Asignar nombre del usuario en el topbar si existe en localstorage
    const userName = localStorage.getItem('userName');
    if (userName) document.getElementById('userEmail').textContent = userName;

    document.getElementById('btnAgregar').addEventListener('click', agregarItem);
});

// GET: Leer e inyectar datos en la tabla
async function cargarInventario() {
    try {
        const response = await fetch('/api/inventory');
        const items = await response.json();
        const tbody = document.getElementById('tablaInventario');
        tbody.innerHTML = '';

        items.forEach(item => {
            const tr = document.createElement('tr');
            
            // Asignar color según tipo
            let badgeClass = 'bg-secondary';
            if(item.tipo === 'Especia') badgeClass = 'bg-warning text-dark';
            if(item.tipo === 'Ingrediente') badgeClass = 'bg-success';
            if(item.tipo === 'Utensilio') badgeClass = 'bg-info text-dark';

            tr.innerHTML = `
                <td><small class="text-muted">${item._id.substring(item._id.length - 5)}</small></td>
                <td class="fw-bold">${item.nombre}</td>
                <td><span class="badge ${badgeClass}">${item.tipo}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-danger px-2 py-0" onclick="actualizarCantidad('${item._id}', ${item.cantidad - 1})">-</button>
                    <span class="mx-3 fs-5">${item.cantidad}</span>
                    <button class="btn btn-sm btn-outline-success px-2 py-0" onclick="actualizarCantidad('${item._id}', ${item.cantidad + 1})">+</button>
                </td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="eliminarItem('${item._id}')">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error al cargar inventario:', error);
    }
}

// POST: Crear nuevo registro usando prompts
async function agregarItem() {
    const nombre = prompt('Ingrese el nombre del artículo:');
    if (!nombre) return;

    const opciones = "1: Especia\n2: Ingrediente\n3: Utensilio";
    const tipoInput = prompt(`Seleccione el tipo:\n${opciones}`);
    
    let tipo = 'Ingrediente'; // default
    if (tipoInput === '1') tipo = 'Especia';
    else if (tipoInput === '3') tipo = 'Utensilio';

    let cantidad = prompt('Ingrese la cantidad en almacén:');
    cantidad = parseInt(cantidad);
    if (isNaN(cantidad) || cantidad < 0) cantidad = 0;

    try {
        const response = await fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, tipo, cantidad })
        });
        if (response.ok) cargarInventario();
    } catch (error) {
        console.error('Error al agregar al inventario:', error);
    }
}

// PUT: Sumar o restar cantidades
async function actualizarCantidad(id, nuevaCantidad) {
    if (nuevaCantidad < 0) return; // Validación para no tener inventario negativo
    try {
        await fetch(`/api/inventory/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cantidad: nuevaCantidad })
        });
        cargarInventario();
    } catch (error) {
        console.error('Error al actualizar inventario:', error);
    }
}

// DELETE: Borrar registro completo
async function eliminarItem(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este artículo de la base de datos?')) return;
    try {
        await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
        cargarInventario();
    } catch (error) {
        console.error('Error al eliminar:', error);
    }
}
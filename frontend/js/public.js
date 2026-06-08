document.addEventListener('DOMContentLoaded', () => {
    cargarMenuPublico();
    cargarSucursalesPublicas();
});

async function cargarMenuPublico() {
    try {
        const res = await fetch('/api/public/menu');
        if (!res.ok) throw new Error("Error fetching menu");
        const platillos = await res.json();
        
        const contenedor = document.getElementById('menuPublicoContainer');
        contenedor.innerHTML = '';

        if (platillos.length === 0) {
            contenedor.innerHTML = '<p class="text-center text-muted">Aún no hay platillos disponibles.</p>';
            return;
        }

        platillos.forEach(platillo => {
            let agotadoEnHTML = '';
            if (platillo.sucursalesAgotado && platillo.sucursalesAgotado.length > 0 && platillo.estado !== 'Agotado') {
                const nombresAgotados = platillo.sucursalesAgotado.map(s => s.nombre || 'Desconocida').join(', ');
                agotadoEnHTML = `<div class="mt-2 text-end text-danger small">Agotado en: <strong>${nombresAgotados}</strong></div>`;
            }

            const div = document.createElement('div');
            div.className = 'col-md-4 col-lg-3 mb-4';
            div.innerHTML = `
                <div class="card menu-card shadow-sm h-100">
                    <img src="${platillo.imagen || 'https://via.placeholder.com/300x200?text=Pollos+Hermanos'}" class="card-img-top menu-img" alt="${platillo.nombre}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold">${platillo.nombre}</h5>
                        <p class="card-text text-muted small flex-grow-1">${platillo.receta || 'Sin descripción'}</p>
                        <div class="d-flex justify-content-between align-items-center mt-3">
                            <span class="precio-tag text-success fw-bold fs-5">$${parseFloat(platillo.precio).toFixed(2)}</span>
                            ${platillo.estado === 'Agotado' ? '<span class="badge bg-danger">Agotado Temporalmente</span>' : (platillo.esMenuDelDia ? '<span class="badge bg-success">Menú del Día</span>' : '')}
                        </div>
                        ${agotadoEnHTML}
                    </div>
                </div>
            `;
            contenedor.appendChild(div);
        });
    } catch (error) {
        console.error("Error al cargar el menú público", error);
    }
}

async function cargarSucursalesPublicas() {
    try {
        const res = await fetch('/api/public/sucursales');
        if (!res.ok) throw new Error("Error fetching sucursales");
        const sucursales = await res.json();

        const contenedor = document.getElementById('sucursalesPublicasContainer');
        contenedor.innerHTML = '';

        if (sucursales.length === 0) {
            contenedor.innerHTML = '<p class="text-center text-muted">Aún no hay sucursales activas.</p>';
            return;
        }

        sucursales.forEach(suc => {
            const div = document.createElement('div');
            div.className = 'col-md-6 col-lg-4 mb-3';
            div.innerHTML = `
                <div class="sucursal-card p-4 h-100">
                    <h5>📍 ${suc.nombre}</h5>
                    <p class="mb-1 text-muted"><small><strong>Dirección:</strong> ${suc.direccion}</small></p>
                    <p class="mb-0 text-muted"><small><strong>Teléfono:</strong> ${suc.telefono}</small></p>
                </div>
            `;
            contenedor.appendChild(div);
        });
    } catch (error) {
        console.error("Error al cargar las sucursales públicas", error);
    }
}

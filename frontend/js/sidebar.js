//Lógica de "Recordarme"
if (localStorage.getItem('token')) {
    if (localStorage.getItem('rememberMe') !== 'true' && !sessionStorage.getItem('sessionActive')) {
        //Si no activó Recordarme y abrió nueva pestaña, limpiamos
        localStorage.clear();
        window.location.href = 'login.html';
    } else {
        sessionStorage.setItem('sessionActive', 'true');
    }
}

//Función global para obtener headers de autenticación

window.getAuthHeaders = function () {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = 'login.html';
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

document.addEventListener('DOMContentLoaded', function () {
    const btnToggle = document.getElementById('btnToggle');
    const sidebar = document.getElementById('sidebar');
    const contenido = document.getElementById('contenido');

    btnToggle.addEventListener('click', function () {
        //Alterna la clase 'oculto' en la barra lateral
        sidebar.classList.toggle('oculto');

        //Alterna la clase 'expandido' en el contenido para que ocupe toda la pantalla
        contenido.classList.toggle('expandido');
    });

    //Lógica del Perfil de Usuario
    const userName = localStorage.getItem('userName') || 'Usuario';
    const userEmail = localStorage.getItem('userEmail') || 'Sin correo';
    const userRole = localStorage.getItem('userRole') || 'empleado';

    //Oculta los links de administrador si no es admin
    if (userRole !== 'admin') {
        const adminLinks = ['proveedores.html', 'empleados.html', 'sucursales.html', 'finanzas.html', 'reportes.html'];

        //1. Oculta en el Sidebar
        const linksSidebar = sidebar.querySelectorAll('a');
        linksSidebar.forEach(link => {
            const href = link.getAttribute('href');
            if (adminLinks.includes(href)) {
                link.style.display = 'none';
            }
        });

        //2. Oculta las tarjetas en el Dashboard (PaginaInicial.html)
        if (contenido) {
            const linksCards = contenido.querySelectorAll('a.btn');
            linksCards.forEach(link => {
                const href = link.getAttribute('href');
                if (adminLinks.includes(href)) {
                    //Oculta la columna entera que contiene la tarjeta
                    const col = link.closest('.col-12');
                    if (col) {
                        col.style.display = 'none';
                    }
                }
            });
        }
    }

    const userEmailSpan = document.querySelector('.user-email');
    if (userEmailSpan) {
        userEmailSpan.textContent = userName;
        userEmailSpan.style.cursor = 'pointer';
        userEmailSpan.style.fontWeight = 'bold';
        userEmailSpan.style.textDecoration = 'underline';
        userEmailSpan.setAttribute('data-bs-toggle', 'offcanvas');
        userEmailSpan.setAttribute('data-bs-target', '#perfilOffcanvas');

        //Inserta la campana de notificaciones junto al perfil
        const navContainer = document.createElement('div');
        navContainer.className = 'd-flex align-items-center ms-auto me-3';
        navContainer.innerHTML = `
            <div id="btnCampanaAlertas" class="position-relative me-3" style="cursor: pointer;" data-bs-toggle="offcanvas" data-bs-target="#alertasOffcanvas">
                <span style="font-size: 1.5rem;">🔔</span>
                <span id="badgeAlertas" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger d-none" style="font-size: 0.65rem;">
                    0
                </span>
            </div>
        `;
        userEmailSpan.parentNode.insertBefore(navContainer, userEmailSpan);

        document.getElementById('btnCampanaAlertas').addEventListener('click', () => {
            document.getElementById('badgeAlertas').classList.add('d-none');
            fetch('/api/reportes/alertas', { headers: window.getAuthHeaders() })
                .then(res => res.json())
                .then(alertas => {
                    const currentAlertIds = alertas.map(a => a.id);
                    localStorage.setItem('alertasLeidas', JSON.stringify(currentAlertIds));
                    setTimeout(cargarAlertas, 500); // Reload after brief delay to remove "Nueva" tags smoothly
                }).catch(err => console.error('Error marcando alertas como leídas:', err));
        });
    }

    //Inyecta el Offcanvas dinámicamente en el body
    const offcanvasHTML = `
        <div class="offcanvas offcanvas-end" tabindex="-1" id="perfilOffcanvas" aria-labelledby="perfilOffcanvasLabel">
            <div class="offcanvas-header" style="background-color: #3b3b98; color: white;">
                <h5 class="offcanvas-title" id="perfilOffcanvasLabel">Mi Perfil</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
            </div>
            <div class="offcanvas-body d-flex flex-column text-center">
                <div class="mb-4 mt-3">
                    <div style="width: 80px; height: 80px; background-color: #e0e0e0; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; color: #555; margin-bottom: 15px;">
                        👤
                    </div>
                    <h4 class="fw-bold">${userName}</h4>
                    <p class="text-muted mb-1">${userEmail}</p>
                    <span class="badge bg-primary text-uppercase">${userRole}</span>
                </div>
                
                <div class="mt-auto mb-3">
                    <hr>
                    <button id="btnCerrarSesion" class="btn btn-danger w-100 fw-bold">Cerrar Sesión</button>
                </div>
            </div>
        </div>
        
        <!-- Offcanvas de Alertas -->
        <div class="offcanvas offcanvas-end" tabindex="-1" id="alertasOffcanvas" aria-labelledby="alertasOffcanvasLabel">
            <div class="offcanvas-header bg-danger text-white">
                <h5 class="offcanvas-title" id="alertasOffcanvasLabel">Notificaciones</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
            </div>
            <div class="offcanvas-body">
                <div id="listaAlertas" class="list-group">
                    <p class="text-center mt-4">Cargando...</p>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', offcanvasHTML);

    //Lógica para cerrar sesión
    document.getElementById('btnCerrarSesion').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'login.html';
    });

    //Fetch Alertas
    const cargarAlertas = async () => {
        try {
            const res = await fetch('/api/reportes/alertas', { headers: window.getAuthHeaders() });
            if (!res.ok) return;
            const alertas = await res.json();

            const badge = document.getElementById('badgeAlertas');
            const lista = document.getElementById('listaAlertas');

            let alertasLeidas = JSON.parse(localStorage.getItem('alertasLeidas') || '[]');
            const currentAlertIds = alertas.map(a => a.id);
            alertasLeidas = alertasLeidas.filter(id => currentAlertIds.includes(id));
            localStorage.setItem('alertasLeidas', JSON.stringify(alertasLeidas));

            const unreadCount = alertas.filter(a => !alertasLeidas.includes(a.id)).length;

            if (alertas.length > 0) {
                if (unreadCount > 0) {
                    badge.textContent = unreadCount;
                    badge.classList.remove('d-none');
                } else {
                    badge.classList.add('d-none');
                }

                lista.innerHTML = '';
                alertas.forEach(alerta => {
                    const isRead = alertasLeidas.includes(alerta.id);
                    const bgClass = isRead ? 'bg-light text-muted' : 'bg-white';
                    lista.innerHTML += `
                        <div class="list-group-item list-group-item-action ${bgClass} border-start border-${alerta.color} border-4 mb-2 shadow-sm rounded">
                            <div class="d-flex w-100 justify-content-between">
                                <h6 class="mb-1 fw-bold text-${alerta.color}">${alerta.tipo} ${!isRead ? '<span class="badge bg-danger ms-1">Nueva</span>' : ''}</h6>
                                <small class="text-muted">${new Date(alerta.fecha).toLocaleDateString()}</small>
                            </div>
                            <p class="mb-1 text-sm">${alerta.mensaje}</p>
                        </div>
                    `;
                });
            } else {
                badge.classList.add('d-none');
                lista.innerHTML = '<p class="text-center text-muted mt-4">No hay notificaciones nuevas 🎉</p>';
            }
        } catch (error) {
            console.error('Error cargando alertas:', error);
        }
    };

    cargarAlertas();
    //Actualiza cada 60 segundos
    setInterval(cargarAlertas, 60000);
});
document.addEventListener('DOMContentLoaded', function () {
    const btnToggle = document.getElementById('btnToggle');
    const sidebar = document.getElementById('sidebar');
    const contenido = document.getElementById('contenido');

    btnToggle.addEventListener('click', function () {
        // Alterna la clase 'oculto' en la barra lateral
        sidebar.classList.toggle('oculto');
        
        // Alterna la clase 'expandido' en el contenido para que ocupe toda la pantalla
        contenido.classList.toggle('expandido');
    });

    // Lógica del Perfil de Usuario
    const userName = localStorage.getItem('userName') || 'Usuario';
    const userEmail = localStorage.getItem('userEmail') || 'Sin correo';
    const userRole = localStorage.getItem('userRole') || 'empleado';

    const userEmailSpan = document.querySelector('.user-email');
    if (userEmailSpan) {
        userEmailSpan.textContent = userName;
        userEmailSpan.style.cursor = 'pointer';
        userEmailSpan.style.fontWeight = 'bold';
        userEmailSpan.style.textDecoration = 'underline';
        userEmailSpan.setAttribute('data-bs-toggle', 'offcanvas');
        userEmailSpan.setAttribute('data-bs-target', '#perfilOffcanvas');
    }

    // Inyectar el Offcanvas dinámicamente en el body
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
    `;

    document.body.insertAdjacentHTML('beforeend', offcanvasHTML);

    // Lógica para cerrar sesión
    document.getElementById('btnCerrarSesion').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });
});
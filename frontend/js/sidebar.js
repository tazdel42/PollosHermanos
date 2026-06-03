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
});
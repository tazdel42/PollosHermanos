document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('floatingInput').value;
    const password = document.getElementById('floatingPassword').value;
    const rememberMe = document.getElementById('flexCheckDefault').checked;
    const alertBox = document.getElementById('alertBox');

    // Alerta de Reinicio
    alertBox.classList.add('d-none');
    alertBox.textContent = '';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.rol);
            localStorage.setItem('userName', data.nombre);
            localStorage.setItem('userEmail', data.email);
            if (data.sucursal) localStorage.setItem('userSucursal', data.sucursal);

            // Guardamos la preferencia de sesión
            localStorage.setItem('rememberMe', rememberMe);
            sessionStorage.setItem('sessionActive', 'true');

            // Esto es el mensaje de éxito
            alertBox.classList.remove('d-none', 'alert-danger');
            alertBox.classList.add('alert-success');
            alertBox.textContent = '¡Inicio de sesión exitoso! Bienvenido :D ';

            // Redirige a la página principal
            setTimeout(() => {
                window.location.href = '/PaginaInicial.html';
            }, 1500);

        } else {
            // Mostrar error
            alertBox.classList.remove('d-none');
            alertBox.textContent = data.message || 'Error al iniciar sesión';
        }
    } catch (error) {
        console.error('Error:', error);
        alertBox.classList.remove('d-none');
        alertBox.textContent = 'Error de conexión con el servidor.';
    }
});

document.getElementById('registroForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('floatingNombre').value;
    const email = document.getElementById('floatingEmail').value;
    const password = document.getElementById('floatingPassword').value;
    const rol = document.getElementById('floatingRol').value;
    const alertBox = document.getElementById('alertBox');

    // Limpia la alerta visual
    alertBox.classList.add('d-none');
    alertBox.textContent = '';

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, email, password, rol })
        });

        const data = await response.json();

        if (response.ok) {
            // Muestra el mensaje de éxito
            alertBox.classList.remove('d-none', 'alert-danger');
            alertBox.classList.add('alert-success');
            alertBox.textContent = '¡Registro exitoso! Redirigiendo al inicio de sesión...';
            
            // Redirige a la pantalla de login
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1500);

        } else {
            // Muestra el mensaje de error del servidor
            alertBox.classList.remove('d-none');
            alertBox.classList.add('alert-danger');
            alertBox.textContent = data.message || 'Error al registrar usuario';
        }
    } catch (error) {
        console.error('Error:', error);
        alertBox.classList.remove('d-none');
        alertBox.classList.add('alert-danger');
        alertBox.textContent = 'Error de conexión con el servidor.';
    }
});

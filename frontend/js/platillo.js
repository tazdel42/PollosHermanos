document.getElementById('btnAgregar').addEventListener('click', function(){

    const tbody = document.getElementById('tablaPlatillos');
    const nuevoID = tbody.rows.length + 1;
    
    // Seccion del nombre del platillo
    let nombre = prompt("Ingrese el nombre del platillo:");

    if (nombre === null) {
        return;
    }

    while (nombre.trim() === "") {
        nombre = prompt ("En nombre es obligatorio. Ingrese el nombre del platillo:");
        if (nombre === null){
            return;
        }
    }
    // Seccion del la Receta del platillo
    let receta = prompt("Ingrese la receta del platillo:");

    if (receta === null){
        return;
    }

    while (receta.trim() === "") {
        receta = prompt("La receta es obligatoria. Ingrese la receta del platillo:");
        if (receta === null){
            return;
        }
    }

    // Seccion del precio del platillo
    let precio = prompt("Ingrese el precio del platillo;");

    if (precio === null){
        return;
    }

    while (precio.trim()===""){
     precio = prompt("Inserte el precio del platillo:");
        if (precio === null){
            return;
        }
        
    }

    const nuevaFila = document.createElement('tr');

    nuevaFila.innerHTML = `
        <td>${nuevoID}</td>
        <td>${nombre}</td>
        <td>${receta}</td>
        <td>${precio}</td>
        <td>
            <span class="badge bg-success">
                Disponible
            </span>   
        </td>
        <td>
            <div class="d-flex gap-2">
                <button class="btn btn-warning btn-sm">
                    Editar
                </button>   
                <button class="btn btn-danger btn-sm" onclick="this.closest('tr').remove()">
                    Eliminar
                </button>
            </div>
        </td>
    `;

    tbody.appendChild(nuevaFila);

});
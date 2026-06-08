const Employee = require('../models/Employee');
const Inventory = require('../models/Inventory');
const Transaccion = require('../models/Transaccion');
const Pedido = require('../models/Pedido');

exports.getResumenGlobal = async (req, res) => {
    try {
        const query = {};
        if (req.user && req.user.rol !== 'admin') {
            query.sucursal = req.user.sucursal;
        }

        // 1. Total Empleados Activos
        const empleados = await Employee.find({ ...query, estado: 'Activo' });
        const totalEmpleados = empleados.length;

        // 2. Transacciones (Ingresos vs Egresos)
        const transacciones = await Transaccion.find(query);
        let ingresosTotales = 0;
        let egresosTotales = 0;
        transacciones.forEach(t => {
            if (t.tipo === 'Ingreso') ingresosTotales += t.monto;
            if (t.tipo === 'Egreso') egresosTotales += t.monto;
        });
        const balanceNeto = ingresosTotales - egresosTotales;

        // 3. Inventario Crítico (cantidad < 10)
        // Nota: Asumiendo que Inventory tiene 'cantidad'
        const inventarioCritico = await Inventory.find({ ...query, cantidad: { $lt: 10 } });
        const itemsCriticos = inventarioCritico.length;

        // 4. Pedidos Pendientes
        const pedidosPendientes = await Pedido.find({ ...query, estado: 'Pendiente' });
        const totalPedidosPendientes = pedidosPendientes.length;

        res.json({
            empleados: {
                activos: totalEmpleados
            },
            finanzas: {
                ingresos: ingresosTotales,
                egresos: egresosTotales,
                balance: balanceNeto
            },
            inventario: {
                criticos: itemsCriticos
            },
            pedidos: {
                pendientes: totalPedidosPendientes
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al generar reporte global', error: error.message });
    }
};

exports.getAlertas = async (req, res) => {
    try {
        const query = {};
        if (req.user && req.user.rol !== 'admin') {
            query.sucursal = req.user.sucursal;
        }

        const alertas = [];

        // Inventario Crítico
        const inventarioCritico = await Inventory.find({ ...query, cantidad: { $lt: 10 } });
        inventarioCritico.forEach(item => {
            alertas.push({
                tipo: 'Inventario',
                mensaje: `El producto "${item.nombre}" tiene nivel crítico (${item.cantidad} ${item.unidad}).`,
                fecha: new Date(),
                color: 'danger'
            });
        });

        // Pedidos Pendientes
        const pedidosPendientes = await Pedido.find({ ...query, estado: 'Pendiente' }).populate('proveedor', 'nombre');
        pedidosPendientes.forEach(pedido => {
            alertas.push({
                tipo: 'Pedido',
                mensaje: `Pedido pendiente de ${pedido.proveedor ? pedido.proveedor.nombre : 'Proveedor Desconocido'}.`,
                fecha: pedido.createdAt,
                color: 'warning'
            });
        });

        res.json(alertas);
    } catch (error) {
        res.status(500).json({ message: 'Error al generar alertas', error: error.message });
    }
};

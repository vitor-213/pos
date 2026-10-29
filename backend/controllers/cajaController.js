import CashRegister from "../models/CashRegister.js";
import CashMovement from "../models/CashMovement.js";
import Sale from "../models/Sale.js";

/**
 * Devuelve la caja abierta o null
 */
const getCajaAbierta = () => CashRegister.findOne({ estado: "abierta" });

// GET /api/caja/actual
export const getCajaActual = async (req, res) => {
  try {
    const caja = await getCajaAbierta().populate(
      "userId_apertura",
      "nombre email rol",
    );
    if (!caja) return res.json({ abierta: false, caja: null });
    res.json({ abierta: true, caja });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al obtener caja actual", error: err.message });
  }
};

// POST /api/caja/abrir
export const abrirCaja = async (req, res) => {
  try {
    const { montoInicial } = req.body;

    if (montoInicial == null || montoInicial < 0) {
      return res.status(400).json({ msg: "Monto inicial inválido" });
    }

    const existe = await getCajaAbierta();
    if (existe) {
      return res.status(400).json({
        msg: "Ya hay una caja abierta. Debe cerrarla antes de abrir otra.",
        caja: existe,
      });
    }

    const caja = await CashRegister.create({
      userId_apertura: req.user._id,
      montoInicial,
      estado: "abierta",
    });

    const populated = await caja.populate(
      "userId_apertura",
      "nombre email rol",
    );
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ msg: "Error al abrir caja", error: err.message });
  }
};

// POST /api/caja/movimiento   (ingreso o egreso manual)
export const registrarMovimiento = async (req, res) => {
  try {
    const { tipo, monto, motivo } = req.body;

    if (!["ingreso", "egreso"].includes(tipo)) {
      return res.status(400).json({ msg: "Tipo inválido (ingreso | egreso)" });
    }
    if (monto == null || monto <= 0) {
      return res.status(400).json({ msg: "Monto inválido" });
    }
    if (!motivo || !motivo.trim()) {
      return res.status(400).json({ msg: "El motivo es obligatorio" });
    }

    const caja = await getCajaAbierta();
    if (!caja) return res.status(400).json({ msg: "No hay caja abierta" });

    const movimiento = await CashMovement.create({
      cajaId: caja._id,
      tipo,
      monto,
      motivo: motivo.trim(),
      userId: req.user._id,
    });

    res.status(201).json(movimiento);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al registrar movimiento", error: err.message });
  }
};

// GET /api/caja/movimientos   (de la caja abierta)
export const getMovimientosCajaActual = async (req, res) => {
  try {
    const caja = await getCajaAbierta();
    if (!caja) return res.status(400).json({ msg: "No hay caja abierta" });

    const movimientos = await CashMovement.find({ cajaId: caja._id })
      .populate("userId", "nombre rol")
      .sort({ fecha: -1 });

    res.json(movimientos);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al obtener movimientos", error: err.message });
  }
};

// GET /api/caja/resumen   (resumen en vivo de la caja abierta)
export const getResumenCajaActual = async (req, res) => {
  try {
    const caja = await getCajaAbierta();
    if (!caja) return res.status(400).json({ msg: "No hay caja abierta" });

    // Sumar ventas por método de pago (solo completadas)
    const ventas = await Sale.aggregate([
      { $match: { cajaId: caja._id, estado: "completada" } },
      {
        $group: {
          _id: "$metodoPago",
          total: { $sum: "$total" },
          cantidad: { $sum: 1 },
        },
      },
    ]);

    const ventasEfectivo = ventas.find((v) => v._id === "efectivo")?.total || 0;
    const ventasTransferencia =
      ventas.find((v) => v._id === "transferencia")?.total || 0;
    const numVentas = ventas.reduce((acc, v) => acc + v.cantidad, 0);

    // Sumar ingresos/egresos manuales
    const movs = await CashMovement.aggregate([
      { $match: { cajaId: caja._id } },
      { $group: { _id: "$tipo", total: { $sum: "$monto" } } },
    ]);
    const ingresos = movs.find((m) => m._id === "ingreso")?.total || 0;
    const egresos = movs.find((m) => m._id === "egreso")?.total || 0;

    // Calcular monto en efectivo esperado (solo aplica el efectivo)
    const montoSistema =
      caja.montoInicial + ventasEfectivo + ingresos - egresos;

    res.json({
      caja: {
        _id: caja._id,
        fechaApertura: caja.fechaApertura,
        montoInicial: caja.montoInicial,
      },
      ventasEfectivo,
      ventasTransferencia,
      totalVentas: ventasEfectivo + ventasTransferencia,
      numVentas,
      ingresos,
      egresos,
      montoSistema,
    });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al obtener resumen", error: err.message });
  }
};

// POST /api/caja/cerrar
export const cerrarCaja = async (req, res) => {
  try {
    const { montoContado } = req.body;
    if (montoContado == null || montoContado < 0) {
      return res.status(400).json({ msg: "Monto contado inválido" });
    }

    const caja = await getCajaAbierta();
    if (!caja) return res.status(400).json({ msg: "No hay caja abierta" });

    // Ventas por método
    const ventas = await Sale.aggregate([
      { $match: { cajaId: caja._id, estado: "completada" } },
      { $group: { _id: "$metodoPago", total: { $sum: "$total" } } },
    ]);
    const ventasEfectivo = ventas.find((v) => v._id === "efectivo")?.total || 0;
    const ventasTransferencia =
      ventas.find((v) => v._id === "transferencia")?.total || 0;

    // Ingresos / egresos
    const movs = await CashMovement.aggregate([
      { $match: { cajaId: caja._id } },
      { $group: { _id: "$tipo", total: { $sum: "$monto" } } },
    ]);
    const ingresos = movs.find((m) => m._id === "ingreso")?.total || 0;
    const egresos = movs.find((m) => m._id === "egreso")?.total || 0;

    // Monto esperado en caja física (efectivo)
    const montoSistema =
      caja.montoInicial + ventasEfectivo + ingresos - egresos;
    const diferencia = montoContado - montoSistema;

    caja.userId_cierre = req.user._id;
    caja.fechaCierre = new Date();
    caja.ventasEfectivo = ventasEfectivo;
    caja.ventasTransferencia = ventasTransferencia;
    caja.totalVentas = ventasEfectivo + ventasTransferencia;
    caja.ingresos = ingresos;
    caja.egresos = egresos;
    caja.montoSistema = montoSistema;
    caja.montoContado = montoContado;
    caja.diferencia = diferencia;
    caja.estado = "cerrada";

    await caja.save();

    const populated = await caja
      .populate("userId_apertura", "nombre email rol")
      .populate("userId_cierre", "nombre email rol");

    res.json(populated);
  } catch (err) {
    res.status(500).json({ msg: "Error al cerrar caja", error: err.message });
  }
};

// GET /api/caja/historial?desde=&hasta=
export const getHistorial = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const filter = { estado: "cerrada" };

    if (desde || hasta) {
      filter.fechaCierre = {};
      if (desde) filter.fechaCierre.$gte = new Date(desde);
      if (hasta) {
        const h = new Date(hasta);
        h.setHours(23, 59, 59, 999);
        filter.fechaCierre.$lte = h;
      }
    }

    const cajas = await CashRegister.find(filter)
      .populate("userId_apertura", "nombre rol")
      .populate("userId_cierre", "nombre rol")
      .sort({ fechaCierre: -1 });

    res.json(cajas);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al obtener historial", error: err.message });
  }
};

// GET /api/caja/:id   (detalle de una caja por id)
export const getCajaById = async (req, res) => {
  try {
    const caja = await CashRegister.findById(req.params.id)
      .populate("userId_apertura", "nombre rol")
      .populate("userId_cierre", "nombre rol");
    if (!caja) return res.status(404).json({ msg: "Caja no encontrada" });

    const movimientos = await CashMovement.find({ cajaId: caja._id })
      .populate("userId", "nombre rol")
      .sort({ fecha: 1 });

    res.json({ caja, movimientos });
  } catch (err) {
    res.status(500).json({ msg: "Error al obtener caja", error: err.message });
  }
};

import { Router } from "express";
import {
  getCajaActual,
  abrirCaja,
  registrarMovimiento,
  getMovimientosCajaActual,
  getResumenCajaActual,
  cerrarCaja,
  getHistorial,
  getCajaById,
} from "../controllers/cajaController.js";
import { protect } from "../middlewares/auth.js";

const router = Router();

router.use(protect); // admin y seller pueden operar la caja

router.get("/actual", getCajaActual);
router.get("/resumen", getResumenCajaActual);
router.get("/movimientos", getMovimientosCajaActual);
router.get("/historial", getHistorial);
router.get("/:id", getCajaById);

router.post("/abrir", abrirCaja);
router.post("/movimiento", registrarMovimiento);
router.post("/cerrar", cerrarCaja);

export default router;

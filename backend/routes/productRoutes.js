import { Router } from "express";
import {
  getProducts,
  getProductById,
  getProductByBarcode,
  getLowStock,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, requireRole } from "../middlewares/auth.js";

const router = Router();

router.use(protect);

router.get("/", getProducts);
router.get("/low-stock", getLowStock);
router.get("/barcode/:code", getProductByBarcode);
router.get("/:id", getProductById);

router.post("/", requireRole("admin"), createProduct);
router.put("/:id", requireRole("admin"), updateProduct);
router.delete("/:id", requireRole("admin"), deleteProduct);

export default router;

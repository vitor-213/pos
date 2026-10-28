import Product from "../models/Product.js";
import Category from "../models/Category.js";
import StockMovement from "../models/StockMovement.js";
import { generateEAN13 } from "../utils/generateBarcode.js";

/**
 * Genera un barcode único con reintentos (por si colisiona)
 */
const generateUniqueBarcode = async () => {
  for (let i = 0; i < 10; i++) {
    const code = generateEAN13();
    const exists = await Product.findOne({ barcode: code });
    if (!exists) return code;
  }
  throw new Error("No se pudo generar un barcode único tras varios intentos");
};

// GET /api/products?search=&category=&activo=
export const getProducts = async (req, res) => {
  try {
    const { search, category, activo } = req.query;
    const filter = {};

    if (search) {
      // Busca por nombre (regex, case-insensitive) o barcode exacto
      filter.$or = [
        { nombre: { $regex: search, $options: "i" } },
        { barcode: search },
      ];
    }
    if (category) filter.categoryId = category;
    if (activo !== undefined) filter.activo = activo === "true";

    const products = await Product.find(filter)
      .populate("categoryId", "nombre")
      .sort({ nombre: 1 });

    res.json(products);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al obtener productos", error: err.message });
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "categoryId",
      "nombre",
    );
    if (!product)
      return res.status(404).json({ msg: "Producto no encontrado" });
    res.json(product);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al obtener producto", error: err.message });
  }
};

// GET /api/products/barcode/:code  (lector de código de barras)
export const getProductByBarcode = async (req, res) => {
  try {
    const product = await Product.findOne({
      barcode: req.params.code,
      activo: true,
    }).populate("categoryId", "nombre");
    if (!product)
      return res
        .status(404)
        .json({ msg: "Producto no encontrado por barcode" });
    res.json(product);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al buscar barcode", error: err.message });
  }
};

// GET /api/products/low-stock
export const getLowStock = async (req, res) => {
  try {
    const products = await Product.find({
      activo: true,
      $expr: { $lte: ["$stock", "$stockMinimo"] },
    })
      .populate("categoryId", "nombre")
      .sort({ stock: 1 });
    res.json(products);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al obtener stock bajo", error: err.message });
  }
};

// POST /api/products (admin)
export const createProduct = async (req, res) => {
  try {
    const {
      nombre,
      barcode,
      categoryId,
      precioCompra,
      precioVenta,
      stock,
      stockMinimo,
      unidad,
    } = req.body;

    if (!nombre || !categoryId || precioCompra == null || precioVenta == null) {
      return res.status(400).json({ msg: "Faltan campos obligatorios" });
    }

    // Verificar categoría existe
    const category = await Category.findById(categoryId);
    if (!category) return res.status(400).json({ msg: "Categoría no válida" });

    // Barcode: si viene, validar único; si no, generar
    let finalBarcode = barcode?.trim();
    if (finalBarcode) {
      const exists = await Product.findOne({ barcode: finalBarcode });
      if (exists)
        return res.status(400).json({ msg: "El barcode ya está en uso" });
    } else {
      finalBarcode = await generateUniqueBarcode();
    }

    const product = await Product.create({
      nombre,
      barcode: finalBarcode,
      categoryId,
      precioCompra,
      precioVenta,
      stock: stock ?? 0,
      stockMinimo: stockMinimo ?? 5,
      unidad: unidad || "unidad",
    });

    // Si se crea con stock inicial > 0, registra movimiento de entrada
    if ((stock ?? 0) > 0) {
      await StockMovement.create({
        productId: product._id,
        tipo: "entrada",
        cantidad: stock,
        motivo: "Stock inicial al crear producto",
        userId: req.user._id,
      });
    }

    const populated = await product.populate("categoryId", "nombre");
    res.status(201).json(populated);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al crear producto", error: err.message });
  }
};

// PUT /api/products/:id (admin)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ msg: "Producto no encontrado" });

    const {
      nombre,
      barcode,
      categoryId,
      precioCompra,
      precioVenta,
      stockMinimo,
      unidad,
      activo,
    } = req.body;

    if (barcode && barcode !== product.barcode) {
      const exists = await Product.findOne({ barcode });
      if (exists)
        return res.status(400).json({ msg: "El barcode ya está en uso" });
      product.barcode = barcode;
    }
    if (categoryId) {
      const cat = await Category.findById(categoryId);
      if (!cat) return res.status(400).json({ msg: "Categoría no válida" });
      product.categoryId = categoryId;
    }
    if (nombre !== undefined) product.nombre = nombre;
    if (precioCompra !== undefined) product.precioCompra = precioCompra;
    if (precioVenta !== undefined) product.precioVenta = precioVenta;
    if (stockMinimo !== undefined) product.stockMinimo = stockMinimo;
    if (unidad !== undefined) product.unidad = unidad;
    if (activo !== undefined) product.activo = activo;

    await product.save();
    const populated = await product.populate("categoryId", "nombre");
    res.json(populated);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al actualizar producto", error: err.message });
  }
};

// DELETE /api/products/:id (admin) → borrado lógico
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ msg: "Producto no encontrado" });

    product.activo = false;
    await product.save();
    res.json({ msg: "Producto desactivado", product });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al eliminar producto", error: err.message });
  }
};

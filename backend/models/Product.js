import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    barcode: { type: String, required: true, unique: true, index: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    precioCompra: { type: Number, required: true, min: 0 },
    precioVenta: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    stockMinimo: { type: Number, default: 5, min: 0 },
    unidad: { type: String, default: "unidad" }, // unidad, kg, lt, etc.
    activo: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Product", productSchema);

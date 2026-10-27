import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    nombre: String,
    cantidad: { type: Number, required: true, min: 1 },
    precioUnit: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const saleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cajaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CashRegister",
      required: true,
    },
    items: [saleItemSchema],
    total: { type: Number, required: true, min: 0 },
    metodoPago: {
      type: String,
      enum: ["efectivo", "transferencia"],
      required: true,
    },
    montoRecibido: { type: Number, default: 0 },
    cambio: { type: Number, default: 0 },
    estado: {
      type: String,
      enum: ["completada", "anulada"],
      default: "completada",
    },
    fecha: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("Sale", saleSchema);

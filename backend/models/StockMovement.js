import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    tipo: {
      type: String,
      enum: ["entrada", "salida", "ajuste", "venta", "anulacion"],
      required: true,
    },
    cantidad: { type: Number, required: true }, // positivo o negativo según tipo
    motivo: { type: String, default: "" },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referencia: { type: mongoose.Schema.Types.ObjectId, default: null }, // saleId / purchaseId
    fecha: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("StockMovement", stockMovementSchema);

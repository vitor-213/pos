import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    nombre: String,
    cantidad: { type: Number, required: true, min: 1 },
    costoUnit: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const purchaseSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [purchaseItemSchema],
    total: { type: Number, required: true, min: 0 },
    fecha: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("Purchase", purchaseSchema);

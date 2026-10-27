import mongoose from "mongoose";

const cashMovementSchema = new mongoose.Schema(
  {
    cajaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CashRegister",
      required: true,
    },
    tipo: { type: String, enum: ["ingreso", "egreso"], required: true },
    monto: { type: Number, required: true, min: 0 },
    motivo: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fecha: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model("CashMovement", cashMovementSchema);

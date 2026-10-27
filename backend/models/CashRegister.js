import mongoose from "mongoose";

const cashRegisterSchema = new mongoose.Schema(
  {
    userId_apertura: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fechaApertura: { type: Date, default: Date.now },
    montoInicial: { type: Number, required: true, min: 0 },

    userId_cierre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    fechaCierre: { type: Date, default: null },

    ventasEfectivo: { type: Number, default: 0 },
    ventasTransferencia: { type: Number, default: 0 },
    totalVentas: { type: Number, default: 0 },
    ingresos: { type: Number, default: 0 },
    egresos: { type: Number, default: 0 },

    montoSistema: { type: Number, default: null },
    montoContado: { type: Number, default: null },
    diferencia: { type: Number, default: null },

    estado: { type: String, enum: ["abierta", "cerrada"], default: "abierta" },
  },
  { timestamps: true },
);

export default mongoose.model("CashRegister", cashRegisterSchema);

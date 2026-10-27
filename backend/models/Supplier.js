import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    contacto: { type: String, default: "" },
    telefono: { type: String, default: "" },
    email: { type: String, default: "" },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Supplier", supplierSchema);

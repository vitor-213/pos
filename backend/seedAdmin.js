import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

const run = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || "admin@pos.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const nombre = process.env.ADMIN_NOMBRE || "Administrador";

  const exists = await User.findOne({ email });
  if (exists) {
    console.log("⚠️  El admin ya existe:", email);
  } else {
    await User.create({ nombre, email, password, rol: "admin" });
    console.log("✅ Admin creado:", email, "/", password);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run();

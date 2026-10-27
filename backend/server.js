import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, msg: "API POS Minisuper funcionando" });
});

// Aquí irán las rutas:
// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
// ...

const PORT = process.env.PORT || 4000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
  });
};

start();

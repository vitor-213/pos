import User from "../models/User.js";
import jwt from "jsonwebtoken";

const signToken = (user) =>
  jwt.sign({ id: user._id, rol: user.rol }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "8h",
  });

// POST /api/auth/register  (solo admin)
export const register = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ msg: "Faltan campos obligatorios" });
    }
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ msg: "El email ya está registrado" });

    const user = await User.create({
      nombre,
      email,
      password,
      rol: rol === "admin" ? "admin" : "seller",
    });

    res.status(201).json({
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al registrar usuario", error: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.activo) {
      return res.status(401).json({ msg: "Credenciales inválidas" });
    }
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ msg: "Credenciales inválidas" });

    res.json({
      token: signToken(user),
      user: {
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al iniciar sesión", error: err.message });
  }
};

// GET /api/auth/me
export const me = async (req, res) => {
  res.json(req.user);
};

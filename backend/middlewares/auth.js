import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No autorizado, falta token" });
    }
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.activo) {
      return res.status(401).json({ msg: "Usuario no válido o inactivo" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token inválido o expirado" });
  }
};

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ msg: "Acceso denegado: rol insuficiente" });
    }
    next();
  };

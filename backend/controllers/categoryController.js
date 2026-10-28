import Category from "../models/Category.js";

// GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ nombre: 1 });
    res.json(categories);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al obtener categorías", error: err.message });
  }
};

// POST /api/categories (admin)
export const createCategory = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre)
      return res.status(400).json({ msg: "El nombre es obligatorio" });

    const exists = await Category.findOne({ nombre: nombre.trim() });
    if (exists) return res.status(400).json({ msg: "La categoría ya existe" });

    const category = await Category.create({
      nombre: nombre.trim(),
      descripcion,
    });
    res.status(201).json(category);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al crear categoría", error: err.message });
  }
};

// PUT /api/categories/:id (admin)
export const updateCategory = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ msg: "Categoría no encontrada" });

    if (nombre && nombre.trim() !== category.nombre) {
      const exists = await Category.findOne({ nombre: nombre.trim() });
      if (exists)
        return res
          .status(400)
          .json({ msg: "Ya existe una categoría con ese nombre" });
      category.nombre = nombre.trim();
    }
    if (descripcion !== undefined) category.descripcion = descripcion;

    await category.save();
    res.json(category);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al actualizar categoría", error: err.message });
  }
};

// DELETE /api/categories/:id (admin)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ msg: "Categoría no encontrada" });

    await category.deleteOne();
    res.json({ msg: "Categoría eliminada" });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error al eliminar categoría", error: err.message });
  }
};

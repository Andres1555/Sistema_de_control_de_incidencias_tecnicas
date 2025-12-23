import {UserService} from "./services.js";
import bcrypt from 'bcryptjs';


export const GetallUserController = async (req, res) => {
  try {
    const users = await UserService.getAll();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error en el controlador", error.message);
    res
      .status(500)
      .json({ message: "Error al obtener a los usuarios", error: error.message });
  }
};

export const GetUserbyidController = async (req, res) => {
  try {
    const { id } = req.params;

    const idnumber = Number(id);

    const users = await UserService.getbyid(idnumber);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error en el controlador:", error.message);
    res
      .status(500)
      .json({ message: "Error al obtener usuario", error: error.message });
  }
};

export const CreateUserController = async (req, res) => {
  try {
    const { ci, nombre, apellido, email, telefono, ficha, rol, extension, password } = req.body;

    if (!ci || !nombre || !apellido || !email || !telefono || !ficha || !rol || !extension || !password) {
      return res.status(400).json({
        message:
          "Todos los campos son obligatorios",
      });
    }

    if (
      typeof ci !== "number" || typeof telefono !== "number" || typeof nombre !== "string" || typeof apellido !== "string" || typeof email !== "string" || typeof ficha !== "number" || typeof rol !== "string" || typeof extension !== "number" || typeof password !== "string") {
      return res.status(400).json({
        message:
          "los campos tienen que ser un tipo de dato valido",
      });
    }
    // Hash password before storing
    const hashed = await bcrypt.hash(password, 10);

    await UserService.create({ ci, nombre, apellido, email, telefono, ficha, rol, extension, password: hashed });
    res.status(201).json({ message: "usuario creado correctamente" });
  } catch (error) {
    console.error("Error:", error.message);
    res
      .status(500)
      .json({ message: "Error al crear un usuario", error: error.message });
  }
};
export const UpdateUserController= async (req, res) => {
  try {
    const ci = Number(req.params.ci);
    const { nombre, apellido, email, telefono, ficha, rol, extension } = req.body;

    if (!ci || !nombre || !apellido || !email || !telefono|| !ficha || !rol || !extension) {
      return res.status(400).json({
        message:
          "Todos los campos son obligatorios",
      });
    }

    if (
      isNaN(ci) ||
      typeof telefono !== "number" ||typeof nombre !== "string" ||typeof apellido !== "string" ||typeof email !== "string" ||typeof ficha !== "number" ||typeof rol !== "string" ||typeof extension !== "number") {
      return res.status(400).json({
        message:
          "los campos tienen que ser un tipo de dato valido",
      });
    }

    await UserService.update(ci, {nombre,apellido,email,telefono,ficha,rol,extension});
    res.status(200).json({ message: "usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error en el controlador:", error.message);
    res
      .status(500)
      .json({
        message: "Error al actualizar usuario",
        error: error.message,
      });
  }
};
export const DeletUserController= async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "El campo es obligatorio" });
    }

    const idnumber = Number(id);

    if (isNaN(idnumber)) {
      return res
        .status(400)
        .json({ message: "id no valida" });
    }

    await UserService.delete(idnumber);
    res.status(200).json({ message: "" });
  } catch (error) {
    console.error("Error:", error.message);
    res
      .status(500)
      .json({ message: "Error no se pudo eliminar al usuario", error: error.message });
  }
};
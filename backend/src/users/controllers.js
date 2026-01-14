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
    const { ci, nombre, apellido, email, telefono, ficha, rol, extension, password, nro_maquina, especializacion } = req.body;

    // Validación básica de campos de usuario
    if (!ci || !nombre || !email || !password) {
      return res.status(400).json({ message: "Nombre, Email, CI y Password son obligatorios" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Convertimos el string de especializaciones en un array para el servicio
    const listaSpecs = especializacion 
      ? especializacion.split(",").map(s => s.trim()).filter(s => s !== "")
      : [];

    const result = await UserService.createCompleteUser({
      ci, nombre, apellido, email, telefono, ficha, rol, extension, 
      password: hashed,
      nro_maquina,
      especializaciones: listaSpecs
    });

    res.status(201).json({ message: "Usuario y datos relacionados creados con éxito", data: result });
  } catch (error) {
    console.error("Error al crear usuario completo:", error.message);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
};
export const UpdateUserController= async (req, res) => {
  try {
    const ci = Number(req.params.ci);
    const { nombre, apellido, email, telefono, extension, ficha, password } = req.body;

    if (!ci) {
      return res.status(400).json({ message: "Se requiere el CI en la ruta" });
    }

    // Al menos uno de los campos debe estar presente
    if (nombre === undefined && apellido === undefined && email === undefined && telefono === undefined && extension === undefined) {
      return res.status(400).json({ message: "Al menos un campo a actualizar debe ser provisto" });
    }

    // Validaciones por campo si fueron provistos
    if (nombre !== undefined && typeof nombre !== 'string') return res.status(400).json({ message: "El campo 'nombre' debe ser string" });
    if (apellido !== undefined && typeof apellido !== 'string') return res.status(400).json({ message: "El campo 'apellido' debe ser string" });
    if (email !== undefined && typeof email !== 'string') return res.status(400).json({ message: "El campo 'email' debe ser string" });
    if (telefono !== undefined && typeof telefono !== 'number') return res.status(400).json({ message: "El campo 'telefono' debe ser number" });
    if (extension !== undefined && typeof extension !== 'number') return res.status(400).json({ message: "El campo 'extension' debe ser number" });

    // Construir objeto con solo las propiedades provistas
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (apellido !== undefined) updateData.apellido = apellido;
    if (email !== undefined) updateData.email = email; // repositorio lo mapeará a correo
    if (telefono !== undefined) updateData.telefono = telefono;
    if (extension !== undefined) updateData.extension = extension;
    if (ficha !== undefined) updateData.ficha = ficha;

    // Si se provee 'password' (clave en claro), la hasheamos antes de guardar
    if (password !== undefined) {
      const hashed = await bcrypt.hash(String(password), 10);
      updateData.password = hashed;
    }

    const updated = await UserService.update(ci, updateData);
    res.status(200).json({ message: "usuario actualizado correctamente", user: updated });
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
export const DeletUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const idnumber = Number(id);

    if (isNaN(idnumber)) {
      return res.status(400).json({ message: "ID no válida" });
    }

    // Llamamos al servicio (que a su vez llama al repository con transacción)
    const result = await UserService.delete(idnumber);

    if (result === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({ message: "Usuario y todos sus datos relacionados eliminados con éxito" });
  } catch (error) {
    console.error("Error en DeletUserController:", error.message);
    res.status(500).json({ 
      message: "Error al eliminar al usuario y su cascada", 
      error: error.message 
    });
  }
};

export const  GetUserbyciController = async (req, res) => {
  try {
    const { search } = req.query; // Captura ?search=VALOR
    const data = await UserService.SearchUsersService(search);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
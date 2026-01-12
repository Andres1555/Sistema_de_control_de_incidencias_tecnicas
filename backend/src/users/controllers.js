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
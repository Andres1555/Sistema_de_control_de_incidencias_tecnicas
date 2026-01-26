import {UserService} from "./services.js";
import bcrypt from 'bcryptjs';


export const GetallUserController = async (req, res) => {
  try {
    
    const page = parseInt(req.query.page) || 1;

    const result = await UserService.getAll(page);

    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error en el controlador", error.message);
    res.status(500).json({ 
      message: "Error al obtener a los usuarios", 
      error: error.message 
    });
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

    if (!ci || !nombre || !email || !password) {
      return res.status(400).json({ message: "CI, Nombre, Email y Password son obligatorios" });
    }

    const hashed = await bcrypt.hash(String(password), 10);

    // Convertimos especializacion de string a array para el service
    const listaSpecs = especializacion 
      ? especializacion.split(",").map(s => s.trim()).filter(s => s !== "")
      : [];

    const result = await UserService.create({
      ci: Number(ci),
      nombre,
      apellido,
      email,
      password: hashed,
      telefono: String(telefono),
      ficha: Number(ficha),
      rol,
      extension: Number(extension),
      nro_maquina: nro_maquina ? String(nro_maquina) : null,
      especializaciones: listaSpecs
    });

    res.status(201).json({ status: 'success', message: "Usuario creado correctamente", data: result });
  } catch (error) {
    console.error("Error en CreateUserController:", error);
    res.status(500).json({ message: "Error al crear el usuario", error: error.message });
  }
};

export const UpdateUserController = async (req, res) => {
  try {
    const ciOriginal = Number(req.params.ci); // El CI que viene en la URL
    if (!ciOriginal) return res.status(400).json({ message: "CI requerido en la ruta" });

    const data = req.body;

    // Hashear contraseña si viene una nueva
    if (data.password) {
      data.password = await bcrypt.hash(String(data.password), 10);
    }

    // Pasamos el identificador original y la data nueva
    const updated = await UserService.update(ciOriginal, data);
    
    res.status(200).json({ message: "Usuario actualizado correctamente", user: updated });
  } catch (error) {
    console.error("Error en UpdateUserController:", error.message);
    res.status(500).json({ message: error.message });
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
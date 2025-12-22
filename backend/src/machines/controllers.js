import {MachineService} from "./services.js";


export const GetallMachineController = async (req, res) => {
  try {
	const machine = await MachineService.getAll();
	res.status(200).json(machine);
  } catch (error) {
	console.error("Error en el controlador", error.message);
	res
	  .status(500)
	  .json({ message: "Error al obtener al obtener todos los reportes", error: error.message });
  }
};

export const CreateMachineController = async (req, res) => {
  try {
    const { id_user, nro_maquina } = req.body;

    // 1. Validación de presencia
    if (!id_user || !nro_maquina) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
      });
    }

    // 2. Validación de tipos de datos
    if (typeof id_user !== "number" || typeof nro_maquina !== "number") {
      return res.status(400).json({
        message: "Los campos deben ser números válidos",
      });
    }

    // 3. Llamada al Servicio (Opción A)
    // Usamos MachineService.create porque así está definido en tu services.js
    await MachineService.create({ id_user, nro_maquina });

    res.status(201).json({ message: "Máquina registrada correctamente" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ 
      message: "Error al crear el registro", 
      error: error.message 
    });
  }
};
export const UpdateMachineController= async (req, res) => {
  try {
	
	const { id_user,nro_maquina} = req.body;

	if (!id_user||!nro_maquina) {
	  return res.status(400).json({
		message:
		  "Todos los campos son obligatorios",
	  });
	}

	if (
	 typeof id_user !== "number"||typeof nro_maquina  !== "number" ) {
	  return res.status(400).json({
		message:
		  "los campos tienen que ser un tipo de dato valido",
	  });
	}

	await MachineService.update({nro_maquina});
	res.status(200).json({ message: "maquina actualizado correctamente" });
  } catch (error) {
	console.error("Error en el controlador:", error.message);
	res
	  .status(500)
	  .json({
		message: "Error al actualizar la maquina",
		error: error.message,
	  });
  }
};
export const DeleteMachineController= async (req, res) => {
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

	await MachineService.delete(idnumber);
	res.status(200).json({ message: "" });
  } catch (error) {
	console.error("Error:", error.message);
	res
	  .status(500)
	  .json({ message: "Error no se pudo eliminar el maquina", error: error.message });
  }
};
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

    // 1. Validar que los campos existan
    if (!id_user || !nro_maquina) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios (id_user, nro_maquina)",
      });
    }

    // 2. Validar tipos de datos (Solo id_user y nro_maquina)
    // Asumo que nro_maquina es número, si es texto cambia "number" por "string"
    if (typeof id_user !== "number" || typeof nro_maquina !== "number") {
      return res.status(400).json({
        message: "Los campos deben ser un tipo de dato válido (números)",
      });
    }

	// 3. Llamar al servicio que internamente usará el repositorio
	await MachineService.create({ id_user, nro_maquina });

    res.status(201).json({ message: "Máquina creada correctamente" });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ 
        message: "Error al crear la máquina", 
        error: error.message 
    });
  }
};
export const UpdateMachineController= async (req, res) => {
	try {
		// Usar `id` del parámetro de ruta para identificar la máquina a actualizar
		const { nro_maquina } = req.body;
		const { id } = req.params;

		if (!id || !nro_maquina) {
			return res.status(400).json({
				message:
					"Todos los campos son obligatorios",
			});
		}

		const idnumber = Number(id);

		if (isNaN(idnumber) || typeof nro_maquina !== "number") {
			return res.status(400).json({
				message:
					"los campos tienen que ser un tipo de dato valido",
			});
		}

		await MachineService.update(idnumber, { nro_maquina });
		res.status(200).json({ message: "Máquina actualizada correctamente" });
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
	  .json({ message: "Error no se pudo eliminar el reporte", error: error.message });
  }
};
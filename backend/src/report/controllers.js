import {ReportService} from "./services.js";
import { Machine } from "../schemas/schemas.js";


export const GetallReportController = async (req, res) => {
  try {
	const report = await ReportService.getAll();
	res.status(200).json(report);
  } catch (error) {
	console.error("Error en el controlador", error.message);
	res
	  .status(500)
	  .json({ message: "Error al obtener al obtener todos los reportes", error: error.message });
  }
};

export const CreateReportController = async (req, res) => {
  try {
		const { caso, id_maquina, nro_maquina, area, estado, descripcion, nombre_natural, clave_natural, clave_win, fecha } = req.body;

		// 1. Validar campos obligatorios (aceptamos id_maquina o nro_maquina)
		if (!caso || (!nro_maquina) || !area || !estado || !descripcion || !nombre_natural || !clave_natural || !clave_win || !fecha) {
			return res.status(400).json({ message: "Todos los campos son obligatorios (incluya id_maquina o nro_maquina)" });
		}

		// 2. Validar tipos básicos
		if (typeof caso !== "string" || typeof area !== "string" || typeof estado !== "string" || typeof descripcion !== "string" || typeof nombre_natural !== "string" || typeof clave_natural !== "string" || typeof clave_win !== "string" || isNaN(Date.parse(fecha))) {
			return res.status(400).json({ message: "Los campos tienen que ser un tipo de dato valido" });
		}

		let machineId = id_maquina;
		if (!machineId) {
			// Buscar la máquina por su número
			const nro = Number(nro_maquina);
			if (isNaN(nro)) return res.status(400).json({ message: "nro_maquina debe ser un número válido" });
			const machine = await Machine.findOne({ where: { nro_maquina: nro } });
			if (!machine) return res.status(400).json({ message: `Máquina con número ${nro} no encontrada` });
			machineId = machine.id;
		}

		await ReportService.create({ caso, id_maquina: Number(machineId), area, estado, descripcion, nombre_natural, clave_natural, clave_win, fecha });

		res.status(201).json({ message: "Reporte creado correctamente" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ 
        message: "Error al crear el reporte", 
        error: error.message 
    });
  }
};
export const UpdateReportController= async (req, res) => {
  try {
	
	const { estado,fecha} = req.body;

	if (!estado||!fecha ) {
	  return res.status(400).json({
		message:
		  "Todos los campos son obligatorios",
	  });
	}

	if (
	 typeof estado !== "string"||typeof fecha !== "date") {
	  return res.status(400).json({
		message:
		  "los campos tienen que ser un tipo de dato valido",
	  });
	}

	await ReportService.update(ci, {estado,fecha});
	res.status(200).json({ message: "reporte actualizado correctamente" });
  } catch (error) {
	console.error("Error en el controlador:", error.message);
	res
	  .status(500)
	  .json({
		message: "Error al actualizar el reporte",
		error: error.message,
	  });
  }
};
export const DeleteReportController= async (req, res) => {
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

	await ReportService.delete(idnumber);
	res.status(200).json({ message: "" });
  } catch (error) {
	console.error("Error:", error.message);
	res
	  .status(500)
	  .json({ message: "Error no se pudo eliminar el reporte", error: error.message });
  }
};
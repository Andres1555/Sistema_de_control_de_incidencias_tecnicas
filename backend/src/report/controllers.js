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

		const created = await ReportService.create({ caso, id_maquina: Number(machineId), area, estado, descripcion, nombre_natural, clave_natural, clave_win, fecha });

		// Respondemos con el objeto creado para que el frontend pueda usar el id
		res.status(201).json({ message: "Reporte creado correctamente", report: created });
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
    const { id } = req.params;
    const idnumber = Number(id);
    if (isNaN(idnumber)) return res.status(400).json({ message: 'id no valida' });

    const allowed = ['caso','id_maquina','area','estado','descripcion','nombre_natural','clave_natural','clave_win','fecha'];
    const payload = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) payload[k] = req.body[k];
    }

    console.log('UpdateReportController - payload recibido:', payload);

    // Validaciones simples
    if (payload.fecha && isNaN(Date.parse(payload.fecha))) return res.status(400).json({ message: "Fecha inválida" });
    if (payload.id_maquina && isNaN(Number(payload.id_maquina))) return res.status(400).json({ message: "id_maquina debe ser un número" });

    const updated = await ReportService.update(idnumber, payload);
    res.status(200).json({ message: "reporte actualizado correctamente", report: updated });
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

	const result = await ReportService.delete(idnumber);
	// result may include counts
	if (typeof result === 'object') {
	  return res.status(200).json({ message: `Reporte eliminado. Casos técnicos eliminados: ${result.casesDeleted || 0}. Relaciones usuario-reporte eliminadas: ${result.reportUsersDeleted || 0}.` });
	}

	res.status(200).json({ message: "Reporte eliminado" });
  } catch (error) {
	console.error("Error:", error.message);
	res
	  .status(500)
	  .json({ message: "Error no se pudo eliminar el reporte", error: error.message });
  }
};
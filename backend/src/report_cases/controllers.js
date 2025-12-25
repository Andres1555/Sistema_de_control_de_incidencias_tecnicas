import {ReportcaseService} from "./services.js";


export const GetallReportcaseController = async (req, res) => {
  try {
	const reportcase = await ReportcaseService.getAll();
	res.status(200).json(reportcase);
  } catch (error) {
	console.error("Error en el controlador", error.message);
	res
	  .status(500)
	  .json({ message: "Error al obtener al obtener todos los reportes", error: error.message });
  }
};

export const CreateReportcaseController = async (req, res) => {
  try {
	const { id_user,id_report,caso_tecnico,resolucion,tiempo } = req.body;

	if (!id_user || !id_report || !caso_tecnico || !resolucion || !tiempo  ) {
	  return res.status(400).json({
		message:
		  "Todos los campos son obligatorios",
	  });
	}

	if (
	  typeof id_user !== "number"||typeof id_report !== "number"||typeof caso_tecnico !== "string"||typeof resolucion !== "string"||typeof tiempo !== "time") {

	  return res.status(400).json({
		message:
		"los campos tienen que ser un tipo de dato valido",});
	}

	await ReportcaseService.create({ id_user,id_report,caso_tecnico,resolucion,tiempo});
	res.status(201).json({ message: "reporte de caso creado correctamente" });
  } catch (error) {
	console.error("Error:", error.message);
	res
	  .status(500)
	  .json({ message: "Error al crear el reporte", error: error.message });
  }
};
export const UpdateReportcaseController= async (req, res) => {
  try {
	
	const { id_user,id_report,caso_tecnico,resolucion,tiempo} = req.body;

	if (!id_user||!id_report||!caso_tecnico||!resolucion||!tiempo) {
	  return res.status(400).json({
		message:
		  "Todos los campos son obligatorios",
	  });
	}

	if (
	 typeof id_user !== "number"||typeof id_report !== "number"||typeof caso_tecnico !== "string"||typeof resolucion !== "string"||typeof tiempo !== "time" ) {
	  return res.status(400).json({
		message:
		  "los campos tienen que ser un tipo de dato valido",
	  });
	}

	await ReportcaseService.update({caso_tecnico,resolucion,tiempo});
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
export const DeleteReportcaseController= async (req, res) => {
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

	await ReportcaseService.delete(idnumber);
	res.status(200).json({ message: "" });
  } catch (error) {
	console.error("Error:", error.message);
	res
	  .status(500)
	  .json({ message: "Error no se pudo eliminar el reporte", error: error.message });
  }
};

export const GetallReportuserController = async (req, res) => {
	try {
		const { id } = req.params;
		if (!id) return res.status(400).json({ message: "Se requiere id de usuario" });
		const idnumber = Number(id);
		if (isNaN(idnumber)) return res.status(400).json({ message: "id no valida" });

		const reportcases = await ReportcaseService.getByUserId(idnumber);
		res.status(200).json(reportcases);
	} catch (error) {
		console.error("Error en el controlador GetallReportuserController", error.message);
		res.status(500).json({ message: "Error al obtener reportes por usuario", error: error.message });
	}
};
import {ReportcaseService} from "./services.js";


export const GetallReportcaseController = async (req, res) => {
  try {
    
    const page = parseInt(req.query.page) || 1;
    const limit = 12;

    const result = await ReportcaseService.getAll(page, limit);
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error en el controlador", error.message);
    res.status(500).json({ 
      message: "Error al obtener todos los casos de reporte", 
      error: error.message 
    });
  }
};
export const CreateReportcaseController = async (req, res) => {
  try {
	// LOG: mostrar headers y body para depuración
	console.log('CreateReportcaseController - headers:', req.headers);
	console.log('CreateReportcaseController - body:', req.body);

	const { id_user,id_report,caso_tecnico,resolucion,tiempo } = req.body;

	if (!id_user || !id_report || !caso_tecnico || !resolucion || !tiempo  ) {
	  return res.status(400).json({
		message:
		  "Todos los campos son obligatorios",
	  });
	}

	if (
	  typeof id_user !== "number" || typeof id_report !== "number" || typeof caso_tecnico !== "string" || typeof resolucion !== "string" || typeof tiempo !== "string") {

	  return res.status(400).json({
		message:
		"Los campos tienen que ser de un tipo válido "});
	}

	// Validar formato de tiempo HH:MM
	const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
	if (!timeRegex.test(String(tiempo))) {
	  return res.status(400).json({ message: "El campo 'tiempo' debe tener formato HH:MM" });
	}

	const created = await ReportcaseService.create({ id_user,id_report,caso_tecnico,resolucion,tiempo});
	// Responder con el objeto creado
	res.status(201).json({ message: "reporte de caso creado correctamente", reportcase: created });
  } catch (error) {
	console.error("Error:", error.message);
	res
	  .status(500)
	  .json({ message: "Error al crear el reporte", error: error.message });
  }
};
export const UpdateReportcaseController= async (req, res) => {
  try {
    const { id } = req.params;
    const idnumber = Number(id);
    if (isNaN(idnumber)) return res.status(400).json({ message: 'id no valida' });

    const { id_user,id_report,caso_tecnico,resolucion,tiempo} = req.body;
    const payload = {};
    if (id_user !== undefined) payload.id_user = id_user;
    if (id_report !== undefined) payload.id_report = id_report;
    if (caso_tecnico !== undefined) payload.caso_tecnico = caso_tecnico;
    if (resolucion !== undefined) payload.resolucion = resolucion;
    if (tiempo !== undefined) payload.tiempo = tiempo;

    // Validaciones simples
    if (payload.id_user !== undefined && isNaN(Number(payload.id_user))) return res.status(400).json({ message: 'id_user debe ser número' });
    if (payload.id_report !== undefined && isNaN(Number(payload.id_report))) return res.status(400).json({ message: 'id_report debe ser número' });
    if (payload.tiempo !== undefined) {
      const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
      if (!timeRegex.test(String(payload.tiempo))) return res.status(400).json({ message: "El campo 'tiempo' debe tener formato HH:MM" });
    }

    const updated = await ReportcaseService.update(idnumber, payload);
    res.status(200).json({ message: "reporte de caso actualizado correctamente", reportcase: updated });
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
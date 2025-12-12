import {ReportService} from "./services.js";


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
    const {
      caso,id_maquina,area,estado,descripcion,nombre_natural,clave_natural,clave_win,fecha,} = req.body;

    // 1. Validar que todos los campos existan (Faltaba id_maquina)
    if (
      !caso ||!id_maquina ||!area ||!estado ||!descripcion ||!nombre_natural ||!clave_natural ||!clave_win ||!fecha
    ) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios",
      });
    }

    // 2. Validar tipos de datos
    if (
      typeof caso !== "string" ||typeof id_maquina !== "number" || typeof area !== "string" || typeof estado !== "string" ||typeof descripcion !== "string" ||typeof nombre_natural !== "string" ||typeof clave_natural !== "string" ||typeof clave_win !== "string" ||typeof fecha !== "string" || isNaN(Date.parse(fecha))) {
      return res.status(400).json({
        message: "Los campos tienen que ser un tipo de dato valido",
      });
    }

    await ReportService.create({
      caso,id_maquina,area,estado,descripcion,nombre_natural,clave_natural,clave_win,fecha,});
    
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
import {ReportService} from "./services.js";
import { Machine } from "../schemas/schemas.js";

export const GetallReportController = async (req, res) => {
  try {
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const userRole = (req.user?.rol || req.user?.role || "").toLowerCase();
    const userArea = req.user?.area;

    const result = await ReportService.getAll(null, page, limit, userRole, userArea);
    
    
    res.status(200).json(result);
  } catch (error) {
    console.error("Error en el controlador", error.message);
    res.status(500).json({ 
      message: "Error al obtener todos los reportes", 
      error: error.message 
    });
  }
};

export const CreateReportController = async (req, res) => {
  try {
    const { 
      nro_maquina, caso, area, estado, descripcion, 
      nombre_natural, nombre_windows, clave_natural, clave_win, fecha,
      cargo, tipo
    } = req.body;

    const authId = req.user?.id;
    const userRole = (req.user?.rol || req.user?.role || "").toLowerCase();
    const isWorker = userRole === 'worker';
    
    const dataForService = {
      nro_maquina: nro_maquina !== undefined && nro_maquina !== null ? String(nro_maquina).trim() : "",
      caso,
      area,
      estado,
      descripcion,
      nombre_natural,
      nombre_windows,
      clave_natural,
      clave_win,
      fecha,
      cargo, 
      tipo,
      id_user: !isWorker ? authId : null,
      id_workers: isWorker ? authId : null
    };

    const createdReport = await ReportService.CreateReportWithMachineService(dataForService);

    res.status(201).json({ 
      status: "success", 
      message: "Reporte y máquina procesados correctamente", 
      report: createdReport 
    });

  } catch (error) {
    console.error("Error en CreateReportController:", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const UpdateReportController = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Llamamos al servicio pasando el body que contiene 'nro_maquina'
    const updated = await ReportService.update(Number(id), req.body);
    
    res.status(200).json({ 
      message: "Reporte actualizado con éxito", 
      report: updated 
    });

  } catch (error) {
    console.error("Error en UpdateReportController:", error.message);
    res.status(500).json({
      message: "Error interno: " + error.message
    });
  }
};
export const EscalateReportController = async (req, res) => {
  try {
    const { id } = req.params;
    const { area } = req.body;

    if (!area) return res.status(400).json({ message: "El área es obligatoria para escalar" });

    const updated = await ReportService.update(Number(id), { departamento: area, estado: 'Escalado' });
    
    res.status(200).json({ 
      message: "Reporte escalado correctamente", 
      report: updated 
    });
  } catch (error) {
    console.error("Error en EscalateReportController:", error.message);
    res.status(500).json({ message: error.message });
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
	  return res.status(200).json({ message: `Reporte eliminado. Casos técnicos eliminados: ${result.casesDeleted || 0}.` });
	}

	res.status(200).json({ message: "Reporte eliminado" });
  } catch (error) {
	console.error("Error:", error.message);
	res
	  .status(500)
	  .json({ message: "Error no se pudo eliminar el reporte", error: error.message });
  }
};

export const Getbycasecontroller = async (req, res) => {
  try {
    const { caso, page = 1, limit = 12 } = req.query;
    const userRole = (req.user?.rol || req.user?.role || "").toLowerCase();
    const userArea = req.user?.area;
    
    const result = await ReportService.getAll(caso, page, limit, userRole, userArea);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const GetByFilterController = async (req, res) => {
  try {
    // Query params: ?area=...&fecha=YYYY-MM-DD
    const { area, fecha } = req.query;
    const userRole = (req.user?.rol || req.user?.role || "").toLowerCase();
    const userArea = req.user?.area;

    const data = await ReportService.GetReportsByFilterService({ area, fecha, userRole, userArea });
    res.status(200).json(Array.isArray(data) ? data : { data });
  } catch (error) {
    console.error('Error en GetByFilterController:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const Getbyidworkereportcontroller = async (req, res) => {
  try {
    // Intentamos obtener el ID del query param ?id_worker=... 
    // o del token decodificado (req.user.id)
    const workerId = req.query.id_worker || (req.user && req.user.id);

    if (!workerId) {
      return res.status(400).json({ message: "No se proporcionó un ID de trabajador válido" });
    }

    const data = await ReportService.GetReportsByWorkerIdService(workerId);
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
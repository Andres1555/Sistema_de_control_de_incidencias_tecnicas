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
    const { 
      nro_maquina, caso, area, estado, descripcion, 
      nombre_natural, clave_natural, clave_win, fecha 
    } = req.body;

    // Obtenemos el ID y Rol del token (inyectados por verifyToken)
    const authId = req.user?.id;
    const userRole = (req.user?.rol || req.user?.role || "").toLowerCase();

    // Determinamos quién es el dueño según el rol del que está logueado
    const isWorker = userRole === 'worker';
    
    const dataForService = {
      nro_maquina: Number(nro_maquina),
      caso,
      area,
      estado,
      descripcion,
      nombre_natural,
      clave_natural,
      clave_win,
      fecha,
      // Asignamos el ID a la columna correspondiente
      id_user: !isWorker ? authId : null,
      id_workers: isWorker ? authId : null
    };

    // Llamamos al servicio (Capa 2)
    const createdReport = await ReportService.CreateReportWithMachineService(dataForService);

    res.status(201).json({ 
      status: "success", 
      message: "Reporte y máquina procesados correctamente", 
      report: createdReport 
    });

  } catch (error) {
    console.error("Error en CreateReportController:", error.message);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  }
};

export const UpdateReportController = async (req, res) => {
  try {
    const { id } = req.params;
    const idnumber = Number(id);
    if (isNaN(idnumber)) return res.status(400).json({ message: 'id no valida' });

    // Pasamos el body tal cual, el Servicio se encargará de limpiar los IDs
    const updated = await ReportService.update(idnumber, req.body);
    
    res.status(200).json({ 
      message: "reporte actualizado correctamente", 
      report: updated 
    });
  } catch (error) {
    console.error("Error en el controlador:", error.message);
    res.status(500).json({
        message: "Error al actualizar el reporte. Verifique IDs de usuario/trabajador.",
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
    const { caso } = req.query; // Captura ?caso=...
    const data = await ReportService.GetReportsService(caso);
    res.status(200).json(data);
  } catch (error) {
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
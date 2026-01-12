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
    const { nro_maquina, caso, area, estado, descripcion, nombre_natural, clave_natural, clave_win, fecha } = req.body;

    // 1. BUSCAR LA MÁQUINA POR SU NÚMERO (el "12" que escribió el usuario)
    const machine = await Machine.findOne({ 
      where: { nro_maquina: Number(nro_maquina) } 
    });

    if (!machine) {
      return res.status(404).json({ message: `La máquina número ${nro_maquina} no existe en el sistema.` });
    }

    // 2. EXTRAER LOS DUEÑOS DE ESA MÁQUINA
    // La tabla Machine ya tiene id_user e id_workers (según tu schema)
    const ownerUserId = machine.id_user;
    const ownerWorkerId = machine.id_workers; // Si tu tabla Machine tiene id_workers

    // 3. LLAMAR AL SERVICIO CON LOS IDS REALES DE LA BASE DE DATOS
    const created = await ReportService.create({ 
      caso, 
      id_maquina: machine.id, // ID REAL (ej: 1) no el número "12"
      id_user: ownerUserId,   // El dueño que encontramos en la tabla Machine
      id_workers: ownerWorkerId, 
      area, 
      estado, 
      descripcion, 
      nombre_natural, 
      clave_natural, 
      clave_win, 
      fecha 
    });

    res.status(201).json({ message: "Reporte creado", report: created });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Error al procesar el reporte", error: error.message });
  }
};
export const UpdateReportController= async (req, res) => {
  try {
    const { id } = req.params;
    const idnumber = Number(id);
    if (isNaN(idnumber)) return res.status(400).json({ message: 'id no valida' });

    // Nota: 'id_user' no se permite modificar desde el cliente; se toma del token en la creación
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
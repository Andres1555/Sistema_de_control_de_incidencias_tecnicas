import { ReportRepository } from "./repositories.js";
import { Machine } from "../schemas/schemas.js"; 
export const ReportService = {
  
 getAll: async (caso = null, page = 1, limit = 12) => {
    try {
      
      const offset = (page - 1) * limit;

      if (caso) {
        return await ReportRepository.getAllFiltered(caso, limit, offset);
      }
      
      const { count, rows } = await ReportRepository.getAll(limit, offset);

      return {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        data: rows
      };
    } catch (error) {
      throw new Error('Error al obtener reportes: ' + error.message);
    }
  },


  CreateReportWithMachineService: async (data) => {
    try {
      // 1. Buscamos si la máquina existe usando el número que vino del front
      let machine = await ReportRepository.findMachineByNro(data.nro_maquina);

      // 2. Si no existe, la creamos y la vinculamos al dueño actual
      if (!machine) {
        machine = await ReportRepository.createMachine({
          nro_maquina: data.nro_maquina,
          id_user: data.id_user,
          id_workers: data.id_workers
        });
      }

      // 3. Creamos el reporte usando el ID real de la máquina encontrada/creada
      const reportPayload = {
        ...data,
        id_maquina: machine.id // El ID primario de la tabla Machine
      };

      return await ReportRepository.createReport(reportPayload);
    } catch (error) {
      throw new Error("Error en el servicio de reportes: " + error.message);
    }
  },

update: async (id, data) => {
  try {
    const updatePayload = { ...data };

    // 1. Obtener el reporte para saber quién es el trabajador (id_workers)
    const report = await ReportRepository.getById(id);
    if (!report) throw new Error("Reporte no encontrado");

    // El ID del trabajador viene del body o ya estaba en el reporte
    const workerId = updatePayload.id_workers || report.id_workers;

    // 2. GESTIÓN DE MÁQUINA: UNA SOLA LÍNEA POR TRABAJADOR
    if (updatePayload.id_maquina !== undefined && workerId) {
      const nroNuevo = Number(updatePayload.id_maquina);

      if (nroNuevo > 0) {
        // BUSCAMOS si este trabajador ya tiene UNA máquina asignada en la tabla Machines
        const workerMachine = await Machine.findOne({ 
          where: { id_workers: workerId } 
        });

        if (workerMachine) {
          // CASO A: El trabajador ya tenía una fila. 
          // ACTUALIZAMOS esa misma línea con el nuevo número.
          await workerMachine.update({ nro_maquina: nroNuevo });
          
          // El reporte debe apuntar al ID de esa fila
          updatePayload.id_maquina = workerMachine.id;
        } else {
          // CASO B: El trabajador no tenía ninguna fila en la tabla Machines.
          // La creamos por primera vez.
          const newMachine = await Machine.create({
            nro_maquina: nroNuevo,
            id_workers: workerId,
            id_user: null // Es de un trabajador
          });
          updatePayload.id_maquina = newMachine.id;
        }
      }
    }

    // 3. LIMPIEZA DE OTROS IDS (Escudo contra duplicados)
    const cleanId = (val) => (val && val !== 0 && val !== "0" && val !== "") ? Number(val) : null;
    if (updatePayload.id_user !== undefined) updatePayload.id_user = cleanId(updatePayload.id_user);
    if (updatePayload.id_workers !== undefined) updatePayload.id_workers = cleanId(updatePayload.id_workers);

    // 4. Actualizar el reporte final
    return await ReportRepository.updateById(id, updatePayload);

  } catch (error) {
    console.error("Error en ReportService.update:", error.message);
    throw error;
  }
},
  delete: async (id) => {
    try {
      const result = await ReportRepository.deleteById(id);
      // Verificamos si se eliminó algo (result.destroyed)
      const destroyed = (typeof result === 'object') ? result.destroyed : result;
      if (!destroyed) throw new Error("Reporte no encontrado para eliminar");
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Este es el método que usa tu SearchBar
  GetReportsService: async (caso) => {
    try {
      return await ReportRepository.getAllFiltered(caso);
    } catch (error) {
      throw new Error('Error en el servicio de búsqueda: ' + error.message);
    }
  },
   GetReportsByWorkerIdService: async (workerId) => {
    try {
      if (!workerId) throw new Error("ID de trabajador es requerido");
      
      const reports = await ReportRepository.getByWorkerId(workerId);
      return reports;
    } catch (error) {
      throw new Error('Error en el servicio: ' + error.message);
    }
  }
};

export default ReportService;
import { ReportRepository } from "./repositories.js";
import { Machine,User,Worker } from "../schemas/schemas.js"; 
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
      // Normalize nro_maquina as string
      const nro = data.nro_maquina !== undefined && data.nro_maquina !== null ? String(data.nro_maquina).trim() : "";

      let machine = await ReportRepository.findMachineByNro(nro);

      if (!machine) {
        machine = await ReportRepository.createMachine({
          nro_maquina: nro,
          id_user: data.id_user,
          id_workers: data.id_workers
        });
      }

      
      const reportPayload = {
        ...data,
        id_maquina: machine.id 
      };

      return await ReportRepository.createReport(reportPayload);
    } catch (error) {
      throw new Error("Error en el servicio de reportes: " + error.message);
    }
  },

 update: async (id, data) => {
    try {
      const updatePayload = { ...data };

      // 1. Obtener el reporte actual para conocer los IDs actuales
      const report = await ReportRepository.getById(id);
      if (!report) throw new Error("Reporte no encontrado");

      // 2. Escudo contra IDs inválidos (0 o vacío -> null)
      const cleanId = (val) => (val && val !== 0 && val !== "0" && val !== "") ? Number(val) : null;
      
      const workerId = updatePayload.id_workers !== undefined ? cleanId(updatePayload.id_workers) : report.id_workers;
      const userId = updatePayload.id_user !== undefined ? cleanId(updatePayload.id_user) : report.id_user;

      // 3. GESTIÓN DE MÁQUINA (Corregir línea existente del dueño)
      if (updatePayload.id_maquina !== undefined) {
        const nroNuevo = updatePayload.id_maquina !== null && updatePayload.id_maquina !== undefined ? String(updatePayload.id_maquina).trim() : "";

        if (nroNuevo !== "") {
          // Buscamos si el DUEÑO (Worker o User) ya tiene una máquina asignada
          const ownerQuery = workerId ? { id_workers: workerId } : { id_user: userId };
          const existingMachine = await Machine.findOne({ where: ownerQuery });

          if (existingMachine) {
            // SI YA TIENE: Actualizamos el identificador (string)
            await existingMachine.update({ nro_maquina: nroNuevo });
            updatePayload.id_maquina = existingMachine.id;
          } else {
            // SI NO TIENE: verificamos si existe una máquina global con ese nro
            const globalMachine = await Machine.findOne({ where: { nro_maquina: nroNuevo } });
            if (globalMachine) {
              // reasignar propietario
              await globalMachine.update({ id_user: userId, id_workers: workerId });
              updatePayload.id_maquina = globalMachine.id;
            } else {
              // crear nueva máquina
              const newMachine = await Machine.create({
                nro_maquina: nroNuevo,
                id_workers: workerId,
                id_user: userId
              });
              updatePayload.id_maquina = newMachine.id;
            }
          }
        } else {
          // Si viene vacío, desvinculamos máquinas del dueño
          await Machine.update({ id_user: null, id_workers: null }, { where: { id_user: userId } });
          // No forzamos updatePayload.id_maquina aquí
        }
      }

      // 4. Validación final de llaves foráneas para el update del reporte
      if (updatePayload.id_user !== undefined) updatePayload.id_user = cleanId(updatePayload.id_user);
      if (updatePayload.id_workers !== undefined) updatePayload.id_workers = cleanId(updatePayload.id_workers);

      // 5. Llamar al repositorio
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
  ,
  GetReportsByFilterService: async ({ area = null, fecha = null } = {}) => {
    try {
      // Normalizar entrada
      const a = area !== undefined && area !== null ? String(area).trim() : null;
      const f = fecha !== undefined && fecha !== null ? String(fecha).trim() : null;
      return await ReportRepository.getByFilter(a, f);
    } catch (error) {
      throw new Error('Error en el servicio de filtros: ' + error.message);
    }
  }
};

export default ReportService;
import { ReportRepository } from "./repositories.js";
import { Machine,User,Worker,Report } from "../schemas/schemas.js"; 
export const ReportService = {
  
 getAll: async (caso = null, page = 1, limit = 12, userRole = "", userArea = "") => {
    try {
      
      const offset = (page - 1) * limit;

      if (caso) {
        const { count, rows } = await ReportRepository.getAllFiltered(caso, limit, offset, userRole, userArea);
        return {
          totalItems: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          data: rows
        };
      }
      
      const { count, rows } = await ReportRepository.getAll(limit, offset, userRole, userArea);

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

      // 1. Buscamos el reporte actual
      const report = await Report.findByPk(id);
      if (!report) throw new Error("Reporte no encontrado");

      // Limpieza de IDs de dueño (User o Worker)
      const cleanId = (val) => (val && val !== 0 && val !== "0" && val !== "") ? Number(val) : null;
      const userId = updatePayload.id_user !== undefined ? cleanId(updatePayload.id_user) : report.id_user;
      const workerId = updatePayload.id_workers !== undefined ? cleanId(updatePayload.id_workers) : report.id_workers;

      // 2. LÓGICA DE TRADUCCIÓN: nro_maquina (String) -> id_maquina (Integer)
      if (updatePayload.nro_maquina !== undefined) {
        const textoNro = updatePayload.nro_maquina ? String(updatePayload.nro_maquina).trim() : "";

        if (textoNro !== "") {
          // Buscamos si la máquina ya existe por su número de serie (atributo nro_maquina)
          // Si no existe, la CREA (Relación 1 a muchos: permitimos que existan muchas máquinas)
          const [machine] = await Machine.findOrCreate({
            where: { nro_maquina: textoNro },
            defaults: {
              id_user: userId,
              id_workers: workerId
            }
          });

          // IMPORTANTE: Asignamos el ID de la tabla Machine al campo id_maquina del Reporte
          updatePayload.id_maquina = machine.id;
        } else {
          updatePayload.id_maquina = null;
        }

        // Eliminamos 'nro_maquina' del payload porque la tabla Report NO tiene esa columna
        delete updatePayload.nro_maquina;
      }

      // 3. Limpiar otros IDs para evitar conflictos de tipos en SQLite
      if (updatePayload.id_user !== undefined) updatePayload.id_user = userId;
      if (updatePayload.id_workers !== undefined) updatePayload.id_workers = workerId;

      // 4. Llamar al repositorio para el update final
      return await ReportRepository.updateById(id, updatePayload);

    } catch (error) {
      console.error("Error en ReportService:", error.message);
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
  GetReportsByFilterService: async ({ area = null, fecha = null, userRole = "", userArea = "" } = {}) => {
    try {
      // Normalizar entrada
      const a = area !== undefined && area !== null ? String(area).trim() : null;
      const f = fecha !== undefined && fecha !== null ? String(fecha).trim() : null;
      return await ReportRepository.getByFilter(a, f, userRole, userArea);
    } catch (error) {
      throw new Error('Error en el servicio de filtros: ' + error.message);
    }
  }
};

export default ReportService;
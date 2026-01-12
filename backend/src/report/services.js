import { ReportRepository } from "./repositories.js";

export const ReportService = {
  // Obtiene todos los reportes o filtrados si el repositorio lo permite
  getAll: async (caso = null) => {
    try {
      // Si pasamos un caso, usamos el filtrado, si no, el getAll normal
      if (caso) {
        return await ReportRepository.getAllFiltered(caso);
      }
      return await ReportRepository.getAll();
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
      const updated = await ReportRepository.updateById(id, data);
      if (!updated) throw new Error("Reporte no encontrado para actualizar");
      return updated;
    } catch (error) {
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
import { ReportRepository } from "./repositories.js";

export const ReportService = {
  getAll: async () => {
    return await ReportRepository.getAll();
  },

  create: async (data) => {
    // data may include id_user coming from req.user set by verifyToken
    return await ReportRepository.createReport(data);
  },

  update: async (id, data) => {
    const updated = await ReportRepository.updateById(id, data);
    if (!updated) throw new Error("Reporte no encontrado para actualizar");
    return updated;
  },

  delete: async (id) => {
    const result = await ReportRepository.deleteById(id);
    // result can be an object { destroyed, casesDeleted }
    const destroyed = (typeof result === 'object') ? result.destroyed : result;
    if (!destroyed) throw new Error("Reporte no encontrado para eliminar");
    return result;
  },
};

export default ReportService;

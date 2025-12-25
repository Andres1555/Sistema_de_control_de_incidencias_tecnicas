import { ReportCaseRepository } from "./repositories.js";

export const ReportcaseService = {
  getAll: async () => {
    return await ReportCaseRepository.getAll();
  },

  getByUserId: async (userId) => {
    return await ReportCaseRepository.getByUserId(userId);
  },

  create: async (data) => {
    return await ReportCaseRepository.createReportCase(data);
  },

  update: async (id, data) => {
    const updated = await ReportCaseRepository.updateById(id, data);
    if (!updated) throw new Error("ReportCase no encontrado para actualizar");
    return updated;
  },

  delete: async (id) => {
    const destroyed = await ReportCaseRepository.deleteById(id);
    if (!destroyed) throw new Error("ReportCase no encontrado para eliminar");
    return destroyed;
  },
};

export default ReportcaseService;

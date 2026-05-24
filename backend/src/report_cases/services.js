import { ReportCaseRepository } from "./repositories.js";
import sequelize, { Report, User } from "../schemas/schemas.js";

export const ReportcaseService = {
  getAll: async (page = 1, limit = 12) => {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await ReportCaseRepository.getAll(limit, offset);

      return {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        data: rows
      };
    } catch (error) {
      throw new Error('Error al obtener casos de reporte: ' + error.message);
    }
  },
 getByCase: async (name) => {
    try {
      // Llamamos a la nueva función del repositorio
      return await ReportCaseRepository.findByUserName(name);
    } catch (error) {
      throw new Error('Error en el servicio de búsqueda: ' + error.message);
    }
  },

  getByUserId: async (userId) => {
    return await ReportCaseRepository.getByUserId(userId);
  },

  create: async (data) => {
    const existing = await ReportCaseRepository.getByReportId(data.id_report);
    if (existing) {
      const err = new Error(`Este reporte ya tiene un caso técnico registrado`);
      err.status = 400;
      throw err;
    }

    const transaction = await sequelize.transaction();
    try {
      const reportCase = await ReportCaseRepository.createReportCase(data, { transaction });
      
      // Update corresponding Report to "resuelto"
      const report = await Report.findByPk(data.id_report, { transaction });
      if (report) {
        const updateData = { estado: 'resuelto' };
        // Si no se asignó quién lo resolvió, asignarlo
        if (!report.resuelto_por) {
          updateData.resuelto_por = data.id_user;
          const user = await User.findByPk(data.id_user, { transaction });
          if (user) {
            updateData.resuelto_por_nombre = `${user.nombre} ${user.apellido}`;
          }
        }
        await report.update(updateData, { transaction });
      }

      await transaction.commit();
      return reportCase;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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

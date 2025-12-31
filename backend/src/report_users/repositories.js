import { ReportUser } from "../schemas/schemas.js";

async function getAll() {
  return await ReportUser.findAll();
}

async function getById(id) {
  if (id === undefined || id === null) return null;
  const byPk = await ReportUser.findByPk(id);
  if (byPk) return byPk;
  return null;
}

async function create(data) {
  const payload = {
    id_user: data.id_user,
    id_report: data.id_report,
  };
  return await ReportUser.create(payload);
}

async function deleteById(id) {
  if (id === undefined || id === null) return 0;
  const destroyed = await ReportUser.destroy({ where: { id } });
  return destroyed;
}

async function deleteByReportId(reportId, options = {}) {
  if (reportId === undefined || reportId === null) return 0;
  const destroyed = await ReportUser.destroy({ where: { id_report: reportId }, ...options });
  return destroyed;
}
export const ReportUserRepository = {
  getAll,
  getById,
  create,
  deleteById,
  deleteByReportId,
};

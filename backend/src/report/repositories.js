import sequelize, { Report, ReportCase, ReportUser } from "../schemas/schemas.js";

async function getAll() {
  return await Report.findAll();
}

async function getById(id) {
  if (id === undefined || id === null) return null;
  const byPk = await Report.findByPk(id);
  if (byPk) return byPk;
  return null;
}

async function createReport(data) {
  const payload = {
    caso: data.caso,
    id_maquina: data.id_maquina,
    area: data.area,
    estado: data.estado,
    descripcion: data.descripcion,
    nombre_natural: data.nombre_natural,
    clave_natural: data.clave_natural,
    // mapeamos 'clave_win' del frontend a 'clave_acceso_windows' en el modelo
    clave_acceso_windows: data.clave_win,
    fecha: data.fecha,
  };
  return await Report.create(payload);
}

async function updateById(id, data) {
  const report = await Report.findByPk(id);
  if (!report) return null;

  // Mapear 'clave_win' -> 'clave_acceso_windows' si viene en el payload
  const updatePayload = { ...data };
  if (updatePayload.clave_win !== undefined) {
    updatePayload.clave_acceso_windows = updatePayload.clave_win;
    delete updatePayload.clave_win;
  }

  await report.update(updatePayload);
  return report;
}

async function deleteById(id) {
  if (id === undefined || id === null) return 0;

  // Usar transacción para consistencia: eliminar dependencias y luego el reporte
  const t = await sequelize.transaction();
  try {
    // Eliminar casos técnicos asociados
    const casesDeleted = await ReportCase.destroy({ where: { id_report: id }, transaction: t });
    // Eliminar relaciones de usuario-report
    const reportUsersDeleted = await ReportUser.destroy({ where: { id_report: id }, transaction: t });
    // Eliminar el reporte
    const destroyed = await Report.destroy({ where: { id }, transaction: t });

    console.log(`ReportRepository.deleteById - eliminado reporte ${id}. casos eliminados: ${casesDeleted}, relaciones report-user eliminadas: ${reportUsersDeleted}, reporte eliminado: ${destroyed}`);

    await t.commit();
    return { destroyed, casesDeleted, reportUsersDeleted };
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

export const ReportRepository = {
  getAll,
  getById,
  createReport,
  updateById,
  deleteById,
  // expose delete related helpers if needed
};

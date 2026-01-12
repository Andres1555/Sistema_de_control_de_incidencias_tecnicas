import sequelize, { Report, ReportCase,Machine } from "../schemas/schemas.js";
import { Op } from "sequelize";


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
  return await Report.create({
    caso: data.caso,
    id_maquina: data.id_maquina,
    id_user: data.id_user || null,
    id_workers: data.id_workers || null,
    area: data.area,
    estado: data.estado,
    descripcion: data.descripcion,
    nombre_natural: data.nombre_natural,
    nombre_windows: data.nombre_windows, // Nuevo atributo
    clave_natural: data.clave_natural,
    clave_acceso_windows: data.clave_win,
    fecha: data.fecha,
  });
}

// Función para buscar la máquina por el número (ej: "12")
async function findMachineByNro(nro) {
  return await Machine.findOne({ where: { nro_maquina: Number(nro) } });
}

// Función para crear la máquina si no existe
async function createMachine(data) {
  return await Machine.create({
    nro_maquina: data.nro_maquina,
    id_user: data.id_user || null,
    id_workers: data.id_workers || null
  });
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
    // Eliminar el reporte
    const destroyed = await Report.destroy({ where: { id }, transaction: t });

    console.log(`ReportRepository.deleteById - eliminado reporte ${id}. casos eliminados: ${casesDeleted}, reporte eliminado: ${destroyed}`);

    await t.commit();
    return { destroyed, casesDeleted };
  } catch (err) {
    await t.rollback();
    throw err;
  }



  
} 

async function getAllFiltered(caso) {
  return await Report.findAll({
    where: {
      caso: {
        [Op.like]: `%${caso}%`
      }
    }
  });
}
async function getByWorkerId(workerId) {
  try {
    return await Report.findAll({
      where: { id_workers: workerId },
      include: [
        {
          model: Machine,
          attributes: ['nro_maquina'] // Para mostrar el número de máquina en la card
        }
      ],
      order: [['id', 'DESC']] // Los más recientes primero
    });
  } catch (error) {
    throw error;
  }
}

export const ReportRepository = {
  getAll,
  getById,
  getAllFiltered, 
  createReport,
  updateById,
  deleteById,
  getByWorkerId,
  createMachine,
  findMachineByNro,
};
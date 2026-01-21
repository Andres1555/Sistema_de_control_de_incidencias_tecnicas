import sequelize, { Report, ReportCase, Machine } from "../schemas/schemas.js";
import { Op } from "sequelize";


const includeMachine = {
  model: Machine,
  attributes: ['nro_maquina']
};

async function getAll(limit, offset) {
  // findAndCountAll devuelve { count: total, rows: [data] }
  return await Report.findAndCountAll({
    limit: limit,
    offset: offset,
    include: [includeMachine],
    order: [['fecha', 'DESC']] // Opcional: ordenar por los más recientes
  });
}

async function getById(id) {
  if (id === undefined || id === null) return null;
  // CAMBIO CLAVE: Añadimos el include aquí para el modal de detalles
  return await Report.findByPk(id, {
    include: [includeMachine]
  });
}

async function createReport(data) {
  const payload = {
    caso: data.caso,
    id_maquina: data.id_maquina,
    id_user: data.id_user || null,
    id_workers: data.id_workers || null,
    area: data.area,
    estado: data.estado,
    descripcion: data.descripcion,
    nombre_natural: data.nombre_natural,
    nombre_windows: data.nombre_windows, 
    clave_natural: data.clave_natural,
    clave_acceso_windows: data.clave_win, 
    fecha: data.fecha,
  };

  return await Report.create(payload);
}
async function findMachineByNro(nro) {
  return await Machine.findOne({ where: { nro_maquina: Number(nro) } });
}

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

  const updatePayload = { ...data };

  
  if (updatePayload.clave_win !== undefined) {
    updatePayload.clave_acceso_windows = updatePayload.clave_win;
    delete updatePayload.clave_win;
  }

  
  await report.update(updatePayload);

  
  return await Report.findByPk(id, {
    include: [{ model: Machine, attributes: ['nro_maquina'] }]
  });
}

async function deleteById(id) {
  if (id === undefined || id === null) return 0;

  const t = await sequelize.transaction();
  try {
    const casesDeleted = await ReportCase.destroy({ where: { id_report: id }, transaction: t });
    const destroyed = await Report.destroy({ where: { id }, transaction: t });
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
    },
    include: [includeMachine]
  });
}

async function getByWorkerId(workerId) {
  try {
    return await Report.findAll({
      where: { id_workers: workerId },
      include: [includeMachine], 
      order: [['id', 'DESC']]
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
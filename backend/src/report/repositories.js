import sequelize, { Report, ReportCase, Machine, User, Worker } from "../schemas/schemas.js";
import { Op } from "sequelize";


const includeMachine = {
  model: Machine,
  attributes: ['nro_maquina']
};

const includeUser = { model: User, attributes: ['nombre', 'apellido'] };
const includeWorker = { model: Worker, attributes: ['nombres', 'apellidos'] };

async function getAll(limit, offset) {
  // findAndCountAll devuelve { count: total, rows: [data] }
  return await Report.findAndCountAll({
    limit: limit,
    offset: offset,
    include: [includeMachine, includeUser, includeWorker],
    order: [['fecha', 'DESC']] // Opcional: ordenar por los más recientes
  });
}

async function getById(id) {
  if (id === undefined || id === null) return null;
  // CAMBIO CLAVE: Añadimos el include aquí para el modal de detalles
  return await Report.findByPk(id, {
    include: [includeMachine, includeUser, includeWorker]
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
    cargo: data.cargo,
  };

  const created = await Report.create(payload);
  return await Report.findByPk(created.id, {
    include: [includeMachine, includeUser, includeWorker]
  });
}
async function findMachineByNro(nro) {
  // nro is stored as string; compare directly
  return await Machine.findOne({ where: { nro_maquina: nro } });
}

async function createMachine(data) {
  return await Machine.create({
    nro_maquina: data.nro_maquina !== undefined && data.nro_maquina !== null ? String(data.nro_maquina) : null,
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
    include: [includeMachine, includeUser, includeWorker]
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
    include: [includeMachine, includeUser, includeWorker]
  });
}

async function getByWorkerId(workerId) {
  try {
    return await Report.findAll({
      where: { id_workers: workerId },
      include: [includeMachine, includeUser, includeWorker], 
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
  getByFilter,
  createReport,
  updateById,
  deleteById,
  getByWorkerId,
  createMachine,
  findMachineByNro,
};

async function getByFilter(area, fecha) {
  const where = {};
  if (area && area !== "") {
    where.area = { [Op.like]: `%${area}%` };
  }
  if (fecha && fecha !== "") {
    // fecha stored as DATEONLY, match exact
    where.fecha = fecha;
  }

  return await Report.findAll({
    where,
    include: [includeMachine, includeUser, includeWorker],
    order: [['fecha', 'DESC']]
  });
}
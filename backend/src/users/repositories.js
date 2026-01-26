import sequelize, { User, Machine, Report, ReportCase, Specialization, SpecializationUsers } from "../schemas/schemas.js";
import { Op } from 'sequelize';

// repositories.js
async function getAll(limit, offset) {
  return await User.findAndCountAll({
    limit: limit,
    offset: offset,
    distinct: true, // ESTO ES VITAL: Evita que cuente varias veces al mismo usuario si tiene varias especializaciones
    include: [
      { model: Machine, attributes: ['nro_maquina'] },
      { 
        model: Specialization, 
        attributes: ['nombre'],
        through: { attributes: [] } 
      }
    ],
    order: [['id', 'ASC']]
  });
}

// Modifica el getById también
async function getById(id) {
  return await User.findByPk(id, {
    include: [
      { model: Machine, attributes: ['nro_maquina'] },
      { 
        model: Specialization, 
        attributes: ['nombre'],
        through: { attributes: [] }
      }
    ]
  });
}

async function createCompleteUser(data) {
  const t = await sequelize.transaction();
  try {
    // 1. Crear el usuario
    const newUser = await User.create({
      nombre: data.nombre,
      apellido: data.apellido,
      correo: data.email,
      password: data.password,
      ficha: Number(data.ficha),
      telefono: String(data.telefono),
      C_I: Number(data.ci),
      rol: data.rol,
      extension: Number(data.extension),
    }, { transaction: t });

    const userId = newUser.id;

    // 2. Crear Máquina automática
    if (data.nro_maquina) {
      await Machine.create({
        id_user: userId,
        nro_maquina: String(data.nro_maquina)
      }, { transaction: t });
    }

    // 3. Procesar Especializaciones
    if (data.especializaciones && data.especializaciones.length > 0) {
      for (const nombre of data.especializaciones) {
        const [spec] = await Specialization.findOrCreate({
          where: { nombre: nombre.toLowerCase().trim() },
          defaults: { nombre: nombre.toLowerCase().trim() },
          transaction: t
        });

        await SpecializationUsers.create({
          id_user: userId,
          id_specia: spec.id
        }, { transaction: t });
      }
    }

    await t.commit();
    return newUser;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

async function updateByCI(ciOriginal, data) {
  // Buscamos al usuario por el CI que viene de la URL
  const user = await User.findOne({ where: { C_I: ciOriginal } });
  
  if (!user) return null;

  const payload = {};
  if (data.nombre !== undefined) payload.nombre = data.nombre;
  if (data.apellido !== undefined) payload.apellido = data.apellido;
  if (data.email !== undefined) payload.correo = data.email;
  if (data.ficha !== undefined) payload.ficha = Number(data.ficha);
  if (data.telefono !== undefined) payload.telefono = Number(data.telefono);
  if (data.rol !== undefined) payload.rol = data.rol;
  if (data.extension !== undefined) payload.extension = Number(data.extension);
  if (data.password !== undefined) payload.password = data.password;
  
  // PERMITIR CAMBIO DE CI: Si en el body viene un ci nuevo, lo actualizamos
  if (data.ci !== undefined) payload.C_I = Number(data.ci);

  await user.update(payload);
  return user;
}
async function deleteByIdOrCI(id) {
  if (!id) return 0;
  const t = await sequelize.transaction();
  try {
    // Borrado en cascada manual para asegurar integridad en SQLite
    const userReports = await Report.findAll({ where: { id_user: id }, transaction: t });
    const reportIds = userReports.map(r => r.id);
    if (reportIds.length > 0) {
      await ReportCase.destroy({ where: { id_report: { [Op.in]: reportIds } }, transaction: t });
    }
    await ReportCase.destroy({ where: { id_user: id }, transaction: t });
    await Report.destroy({ where: { id_user: id }, transaction: t });
    await Machine.destroy({ where: { id_user: id }, transaction: t });
    await SpecializationUsers.destroy({ where: { id_user: id }, transaction: t });
    const destroyed = await User.destroy({ where: { [Op.or]: [{ id: id }, { C_I: id }] }, transaction: t });
    await t.commit();
    return destroyed;
  } catch (error) {
    if (t) await t.rollback();
    throw error;
  }
}

async function findBySearch(term) {
  if (!term) return await User.findAll({ limit: 20 });
  const cleanTerm = term.trim();
  const isNumber = /^\d+$/.test(cleanTerm);

  return await User.findAll({
    where: {
      [Op.or]: [
        { nombre: { [Op.like]: `%${cleanTerm}%` } },
        { apellido: { [Op.like]: `%${cleanTerm}%` } },
        { correo: { [Op.like]: `%${cleanTerm}%` } },
        ...(isNumber ? [{ C_I: Number(cleanTerm) }, { ficha: Number(cleanTerm) }] : [])
      ]
    },
    include: [{ model: Machine, attributes: ['nro_maquina'] }],
    order: [['nombre', 'ASC']]
  });
}

export const UserRepository = {
  getAll,
  getById,
  createCompleteUser,
  updateByCI,
  deleteByIdOrCI,
  findBySearch 
};
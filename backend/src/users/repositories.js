import sequelize, { User,Machine, Report, ReportCase, SpecializationUsers } from "../schemas/schemas.js";
import { Op } from 'sequelize';

async function getAll() {
  return await User.findAll();
}

async function getById(id) {
  if (id === undefined || id === null) return null;
  const byPk = await User.findByPk(id);
  if (byPk) return byPk;
  const byCI = await User.findOne({ where: { C_I: id } });
  return byCI;
}

async function createUser(data) {
  const payload = {
    nombre: data.nombre,
    apellido: data.apellido,
    correo: data.email,
    password: data.password,
    ficha: data.ficha,
    telefono: data.telefono,
    C_I: data.ci,
    rol: data.rol,
    extension: data.extension,
  };
  return await User.create(payload);
}

async function updateByCI(ci, data) {
  const user = await User.findOne({ where: { C_I: ci } });
  if (!user) return null;
  const payload = {};
  if (data.nombre !== undefined) payload.nombre = data.nombre;
  if (data.apellido !== undefined) payload.apellido = data.apellido;
  if (data.email !== undefined) payload.correo = data.email;
  if (data.ficha !== undefined) payload.ficha = data.ficha;
  if (data.telefono !== undefined) payload.telefono = data.telefono;
  if (data.rol !== undefined) payload.rol = data.rol;
  if (data.extension !== undefined) payload.extension = data.extension;
  await user.update(payload);
  return user;
}

async function deleteByIdOrCI(id) {
  if (!id) return 0;

  // Usamos la instancia 'sequelize' (minúscula) para la transacción
  const t = await sequelize.transaction();

  try {
    // 1. Obtener reportes para borrar sus casos técnicos
    const userReports = await Report.findAll({ where: { id_user: id }, transaction: t });
    const reportIds = userReports.map(r => r.id);

    if (reportIds.length > 0) {
      await ReportCase.destroy({ 
        where: { id_report: { [Op.in]: reportIds } }, 
        transaction: t 
      });
    }

    // 2. Borrar donde el usuario fue el técnico (id_user en ReportCase)
    await ReportCase.destroy({ where: { id_user: id }, transaction: t });

    // 3. Borrar Reportes, Máquinas y Especializaciones
    await Report.destroy({ where: { id_user: id }, transaction: t });
    await Machine.destroy({ where: { id_user: id }, transaction: t });
    await SpecializationUsers.destroy({ where: { id_user: id }, transaction: t });

    // 4. BORRADO FINAL DEL USUARIO
    // NOTA: Usamos [Op.or], NO [Sequelize.Op.or]
    const destroyed = await User.destroy({ 
      where: { 
        [Op.or]: [
          { id: id }, 
          { C_I: id }
        ] 
      }, 
      transaction: t 
    });

    await t.commit();
    return destroyed;

  } catch (error) {
    if (t) await t.rollback();
    console.error("Error en cascada:", error.message);
    throw error;
  }
}

// Nueva función de búsqueda para el repositorio
async function findBySearch(term) {
  try {
    if (!term) return await User.findAll();

    const cleanTerm = term.trim();
    const isNumber = /^\d+$/.test(cleanTerm); 

    return await User.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.like]: `%${cleanTerm}%` } },
          { apellido: { [Op.like]: `%${cleanTerm}%` } },
          { correo: { [Op.like]: `%${cleanTerm}%` } },
          ...(isNumber ? [
            { C_I: Number(cleanTerm) }, 
            { ficha: Number(cleanTerm) }
          ] : [])
        ]
      },
      order: [['nombre', 'ASC']]
    });
  } catch (error) {
    throw error;
  }
}

export const UserRepository = {
  getAll,
  getById,
  createUser,
  updateByCI,
  deleteByIdOrCI,
  findBySearch 
};
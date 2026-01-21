import sequelize, { ReportCase, User, Report } from "../schemas/schemas.js"; 
import { Op } from "sequelize";

async function getAll(limit, offset) {
  return await ReportCase.findAndCountAll({
    limit: limit,
    offset: offset,
    
  });
}

 async function findByUserName(nameTerm) {
  try {
    const cleanTerm = nameTerm.trim();

    return await ReportCase.findAll({
      include: [
        {
          model: User,
          required: true,
          where: {
            [Op.or]: [
              // 1. Buscar solo en nombre (ej: "Andres")
              { nombre: { [Op.like]: `%${cleanTerm}%` } },
              // 2. Buscar solo en apellido (ej: "Gonzalez")
              { apellido: { [Op.like]: `%${cleanTerm}%` } },
              // 3. BUSCAR NOMBRE COMPLETO (ej: "Andres Gonzalez")
              // Esto pega nombre + espacio + apellido y lo compara con lo que escribiste
              sequelize.where(
                sequelize.literal(`"User"."nombre" || ' ' || "User"."apellido"`),
                { [Op.like]: `%${cleanTerm}%` }
              )
            ]
          },
          attributes: ['id', 'nombre', 'apellido', 'rol'] 
        },
        {
          model: Report,
          attributes: ['caso', 'area'] 
        }
      ],
      order: [['id', 'DESC']]
    });
  } catch (error) {
    console.error("Error en findByUserName Repository:", error);
    throw error;
  }
}
async function getById(id) {
  if (id === undefined || id === null) return null;
  const byPk = await ReportCase.findByPk(id);
  if (byPk) return byPk;
  return null;
}

async function getByUserId(userId) {
  if (userId === undefined || userId === null) return [];
  return await ReportCase.findAll({ where: { id_user: userId } });
}

async function createReportCase(data) {
  const payload = {
    id_user: data.id_user,
    id_report: data.id_report,
    caso_tecnico: data.caso_tecnico,
    resolucion: data.resolucion,
    tiempo: data.tiempo,
  };
  return await ReportCase.create(payload);
}

async function updateById(id, data) {
  const rc = await ReportCase.findByPk(id);
  if (!rc) return null;
  await rc.update(data);
  return rc;
}

async function deleteById(id) {
  if (id === undefined || id === null) return 0;
  const destroyed = await ReportCase.destroy({ where: { id } });
  return destroyed;
}

async function deleteByReportId(reportId, options = {}) {
  if (reportId === undefined || reportId === null) return 0;
  const destroyed = await ReportCase.destroy({ where: { id_report: reportId }, ...options });
  return destroyed;
}
export const ReportCaseRepository = {
  getAll,
  getById,
  getByUserId,
  createReportCase,
  updateById,
  deleteById,
  deleteByReportId,
  findByUserName

};

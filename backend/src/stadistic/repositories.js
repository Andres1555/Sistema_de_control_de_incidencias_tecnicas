import { Report } from '../schemas/schemas.js';
import sequelize from '../schemas/schemas.js';
import { Op } from 'sequelize';

export const StadisticRepository = {
  // from/to are strings 'YYYY-MM-DD' (inclusive)
  getCountByStatus: async (from, to) => {
    const where = {};
    if (from && to) {
      where.fecha = { [Op.between]: [from, to] };
    } else if (from) {
      where.fecha = { [Op.gte]: from };
    } else if (to) {
      where.fecha = { [Op.lte]: to };
    }

    return await Report.findAll({
      attributes: [
        'estado',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      where,
      group: ['estado'],
      raw: true
    });
  },

  getTotalReports: async (from, to) => {
    const where = {};
    if (from && to) {
      where.fecha = { [Op.between]: [from, to] };
    } else if (from) {
      where.fecha = { [Op.gte]: from };
    } else if (to) {
      where.fecha = { [Op.lte]: to };
    }
    return await Report.count({ where });
  }
};
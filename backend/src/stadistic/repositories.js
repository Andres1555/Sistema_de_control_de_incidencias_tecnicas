import { Report } from '../schemas/schemas.js';
import sequelize from '../schemas/schemas.js';

export const StadisticRepository = {
  getCountByStatus: async () => {
    return await Report.findAll({
      attributes: [
        'estado',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total']
      ],
      group: ['estado'],
      raw: true
    });
  },

  getTotalReports: async () => {
    return await Report.count();
  }
};
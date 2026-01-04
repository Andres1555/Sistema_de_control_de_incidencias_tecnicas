import { StadisticRepository } from './repositories.js';

export const StadisticService = {
  // options may include { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
  GetallstadisticService: async (options = {}) => {
    const { from, to } = options;
    const statusCounts = await StadisticRepository.getCountByStatus(from, to);
    const total = await StadisticRepository.getTotalReports(from, to);

    const statistics = statusCounts.map(item => {
      const cantidad = parseInt(item.total);
      const porcentaje = total > 0 ? parseFloat(((cantidad / total) * 100).toFixed(2)) : 0;

      return {
        estado: item.estado || "Desconocido",
        cantidad: cantidad,
        porcentaje: porcentaje
      };
    });

    return {
      total_reportes: total,
      data: statistics
    };
  },

  GetstadisticbynameService: async (id) => {
    return { id, info: "Lógica para estadística individual" };
  }
};
import { StadisticRepository } from './repositories.js';

export const StadisticService = {
  GetallstadisticService: async () => {
    const statusCounts = await StadisticRepository.getCountByStatus();
    const total = await StadisticRepository.getTotalReports();

    const statistics = statusCounts.map(item => {
      const cantidad = parseInt(item.total);
      const porcentaje = total > 0 ? ((cantidad / total) * 100).toFixed(2) : 0;

      return {
        estado: item.estado || "Desconocido",
        cantidad: cantidad,
        porcentaje: `${porcentaje}%`
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
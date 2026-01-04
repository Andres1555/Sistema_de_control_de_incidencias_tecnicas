import {StadisticService} from "./services.js";

export const GetallstadisticController = async (req, res) => {
  try {
    const data = await StadisticService.GetallstadisticService();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas', message: error.message });
  }
};

export const GetstadisticbynameController = async (req, res) => {
  try {
    const { id } = req.params;
    // Aquí podrías filtrar estadísticas por un área o técnico específico
    res.status(200).json({ message: "Estadística filtrada por ID/Nombre" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


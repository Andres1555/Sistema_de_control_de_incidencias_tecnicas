import {StadisticService} from "./services.js";

function formatDate(dt) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const GetallstadisticController = async (req, res) => {
  try {
    const { period = 'month', date } = req.query;
    const inputDate = date ? new Date(date) : new Date();
    let fromDate = new Date(inputDate);
    let toDate = new Date(inputDate);

    switch ((period || 'month').toLowerCase()) {
      case 'day':
        // same day
        break;
      case 'week':
        // week starting Monday
        const diff = (inputDate.getDay() + 6) % 7; // 0 for Monday
        fromDate = new Date(inputDate);
        fromDate.setDate(inputDate.getDate() - diff);
        toDate = new Date(fromDate);
        toDate.setDate(fromDate.getDate() + 6);
        break;
      case 'month':
        fromDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);
        toDate = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 0);
        break;
      case 'year':
        fromDate = new Date(inputDate.getFullYear(), 0, 1);
        toDate = new Date(inputDate.getFullYear(), 11, 31);
        break;
      default:
        // fallback to month
        fromDate = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);
        toDate = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 0);
    }

    const from = formatDate(fromDate);
    const to = formatDate(toDate);

    const data = await StadisticService.GetallstadisticService({ from, to });
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


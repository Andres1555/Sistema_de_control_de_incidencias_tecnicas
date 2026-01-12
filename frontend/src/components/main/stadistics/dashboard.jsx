import React, { useEffect, useState } from "react";
import axios from "axios";
// Importamos algunos iconos para mejorar la interfaz
import { FiChevronLeft, FiChevronRight, FiCalendar, FiRefreshCw } from "react-icons/fi";

const colors = ["#4CAF50", "#F44336", "#FFC107", "#2196F3", "#9C27B0", "#FF5722", "#607D8B"];

// Componente PieChart (se mantiene igual, solo pequeños ajustes de estilo)
const PieChart = ({ data = [], size = 220, darkMode }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <div className="py-10 text-gray-500 italic">No hay datos para mostrar</div>;
  }

  const slices = data.map(d => {
    const porcentaje = typeof d.porcentaje === 'string' ? parseFloat(d.porcentaje.replace('%', '')) : Number(d.porcentaje || 0);
    return { ...d, porcentaje: isNaN(porcentaje) ? 0 : porcentaje };
  });

  let cumulative = 0;
  const stops = slices.map((s, i) => {
    const start = cumulative;
    cumulative += s.porcentaje;
    const end = cumulative;
    const color = colors[i % colors.length];
    return `${color} ${start}% ${end}%`;
  }).join(', ');

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 justify-center">
      <div 
        style={{ 
          width: size, height: size, borderRadius: '50%', 
          background: `conic-gradient(${stops})`,
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }} 
      />
      <div className="flex flex-col gap-2">
        {slices.map((s, i) => (
          <div key={s.estado} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-sm" style={{ background: colors[i % colors.length] }} />
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className="font-bold uppercase text-[11px]">{s.estado}:</span> {s.cantidad} ({s.porcentaje.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = ({ darkMode = false }) => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [period, setPeriod] = useState('month'); 
  // Usamos formato ISO (YYYY-MM-DD) para el input date nativo
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const res = await axios.get(`${base}/api/stadistic`, { params: { period, date: selectedDate } });
        if (!mounted) return;
        setTotal(res.data?.total_reportes ?? 0);
        setData(Array.isArray(res.data?.data) ? res.data.data.map(d => ({
          estado: d.estado,
          cantidad: Number(d.cantidad) || 0,
          porcentaje: Number(d.porcentaje || 0)
        })) : []);
      } catch (err) {
        setError('Error al obtener estadísticas');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    return () => { mounted = false; };
  }, [period, selectedDate]);

  // Función para navegar en el tiempo (Botones Anterior/Siguiente)
  const navigateDate = (direction) => {
    const date = new Date(selectedDate + 'T00:00:00');
    switch (period) {
      case 'day': date.setDate(date.getDate() + direction); break;
      case 'week': date.setDate(date.getDate() + (direction * 7)); break;
      case 'month': date.setMonth(date.getMonth() + direction); break;
      case 'year': date.setFullYear(date.getFullYear() + direction); break;
      default: break;
    }
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const resetToday = () => setSelectedDate(new Date().toISOString().split('T')[0]);

  const controlStyles = darkMode 
    ? "bg-gray-800 border-gray-700 text-gray-200" 
    : "bg-white border-gray-200 text-gray-700";

  return (
    <div className="p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Estadísticas de Reportes</h2>
        
        {/* Selector de Periodo */}
        <div className="flex bg-blue-600/10 p-1 rounded-lg">
          {['day', 'week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase transition-all ${
                period === p 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "text-blue-600 hover:bg-blue-600/10"
              }`}
            >
              {p === 'day' ? 'Día' : p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>
      </div>

      {/* CONTROLES DE FECHA INTUITIVOS */}
      <div className={`flex flex-wrap items-center gap-3 p-4 rounded-xl border mb-8 ${controlStyles}`}>
        <div className="flex items-center gap-2 mr-4">
          <FiCalendar className="text-blue-500" />
          <span className="text-sm font-bold uppercase tracking-wider">Fecha de consulta:</span>
        </div>

        <div className="flex items-center gap-1 bg-gray-500/10 rounded-lg p-1">
          <button 
            onClick={() => navigateDate(-1)}
            className="p-2 hover:bg-blue-600 hover:text-white rounded-md transition-colors"
            title="Anterior"
          >
            <FiChevronLeft size={20} />
          </button>

          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`px-3 py-1.5 rounded-md border-none bg-transparent font-semibold focus:ring-0 cursor-pointer`}
          />

          <button 
            onClick={() => navigateDate(1)}
            className="p-2 hover:bg-blue-600 hover:text-white rounded-md transition-colors"
            title="Siguiente"
          >
            <FiChevronRight size={20} />
          </button>
        </div>

        <button 
          onClick={resetToday}
          className="ml-auto flex items-center gap-2 px-4 py-2 text-xs font-bold border border-blue-500/50 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-all"
        >
          <FiRefreshCw /> HOY
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20 animate-pulse text-blue-500 font-bold uppercase tracking-widest">
            Actualizando datos...
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg text-center">
            {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico */}
          <div className={`lg:col-span-2 p-6 rounded-2xl border ${darkMode ? 'bg-[#1a222f] border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}> 
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              Distribución por estado
            </h3>
            <PieChart data={data} darkMode={darkMode} />
          </div>

          {/* Tarjeta de Resumen */}
          <div className="flex flex-col gap-6">
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-[#1a222f] border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total de Reportes</p>
                <h4 className="text-4xl font-black text-blue-500">{total}</h4>
            </div>

            <div className={`p-6 rounded-2xl border flex-1 ${darkMode ? 'bg-[#1a222f] border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}> 
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Métricas Detalladas</h3>
                <div className="space-y-4">
                {data.length === 0 && <div className="text-gray-500 text-sm italic">Sin registros en este periodo</div>}
                {data.map((d, i) => (
                    <div key={d.estado} className="group">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold uppercase text-gray-400">{d.estado}</span>
                            <span className="text-xs font-black">{d.cantidad}</span>
                        </div>
                        <div className="w-full bg-gray-500/10 h-1.5 rounded-full overflow-hidden">
                            <div 
                                className="h-full transition-all duration-1000" 
                                style={{ 
                                    width: `${d.porcentaje}%`, 
                                    background: colors[i % colors.length] 
                                }} 
                            />
                        </div>
                    </div>
                ))}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
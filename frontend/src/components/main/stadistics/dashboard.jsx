import React, { useEffect, useState } from "react";
import axios from "axios";
import { FiChevronLeft, FiChevronRight, FiCalendar, FiRefreshCw } from "react-icons/fi";

const colors = ["#4CAF50", "#F44336", "#FFC107", "#2196F3", "#9C27B0", "#FF5722", "#607D8B"];

// --- COMPONENTE PIE CHART ---
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
        className="transition-transform duration-500 hover:scale-105"
        style={{ 
          width: size, height: size, borderRadius: '50%', 
          background: `conic-gradient(${stops})`,
          boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
        }} 
      />
      <div className="flex flex-col gap-2">
        {slices.map((s, i) => (
          <div key={s.estado} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-sm" style={{ background: colors[i % colors.length] }} />
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className="font-black uppercase text-[10px] tracking-tighter">{s.estado}:</span> {s.cantidad} ({s.porcentaje.toFixed(1)}%)
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

  return (
    <div className="p-2 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className={`text-3xl font-black uppercase tracking-tighter ${darkMode ? 'text-white' : 'text-[#1a1a1a]'}`}>
          Panel de Estadísticas
        </h2>
        
        {/* Selector de Periodo - FONDO NEGRO TEXTO BLANCO SOLIDO */}
        <div className="flex p-1.5 rounded-2xl bg-gray-500/10 border border-gray-500/20 shadow-inner">
          {['day', 'week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 shadow-md ${
                period === p 
                  ? "bg-[#1a1a1a] text-white" 
                  : "text-gray-500 hover:text-[#1a1a1a]"
              }`}
            >
              {p === 'day' ? 'Día' : p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>
      </div>

      {/* CONTROLES DE FECHA - FLECHAS CON ICONO BLANCO SOLIDO */}
      <div className={`flex flex-wrap items-center gap-4 p-6 rounded-3xl border mb-10 shadow-sm ${
        darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
      }`}>
        <div className="flex items-center gap-2 mr-4">
          <FiCalendar className="text-blue-500" size={20} />
          <span className={`text-[11px] font-black uppercase tracking-widest ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Consulta Temporal
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón Flecha Izquierda - Fondo Negro Icono Blanco */}
          <button 
            onClick={() => navigateDate(-1)}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#1a1a1a] text-white transition-all active:scale-90 shadow-lg hover:bg-gray-800"
          >
            <FiChevronLeft size={24} strokeWidth={4} />
          </button>

          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`px-4 py-2 rounded-xl border-2 border-gray-500/20 bg-transparent font-black text-sm outline-none transition-all cursor-pointer ${
              darkMode ? 'text-white' : 'text-black'
            } focus:border-blue-500`}
          />

          {/* Botón Flecha Derecha - Fondo Negro Icono Blanco */}
          <button 
            onClick={() => navigateDate(1)}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#1a1a1a] text-white transition-all active:scale-90 shadow-lg hover:bg-gray-800"
          >
            <FiChevronRight size={24} strokeWidth={4} />
          </button>
        </div>

        {/* Botón HOY - Fondo Rojo Texto Blanco */}
        <button 
          onClick={resetToday}
          className="ml-auto flex items-center gap-3 h-11 px-8 text-[10px] font-black bg-red-600 text-white hover:bg-red-700 rounded-xl transition-all uppercase active:scale-95 shadow-xl"
        >
          <FiRefreshCw className="stroke-[3]" size={14} /> 
          Volver a hoy
        </button>
      </div>

      {/* ... Resto del Dashboard ... */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className={`lg:col-span-2 p-8 rounded-[2rem] border-2 ${darkMode ? 'bg-[#1a222f] border-gray-700' : 'bg-white border-gray-100'} shadow-xl`}> 
            <PieChart data={data} darkMode={darkMode} />
          </div>
          <div className="flex flex-col gap-6">
            <div className={`p-8 rounded-[2rem] border-2 ${darkMode ? 'bg-[#1a222f] border-gray-700' : 'bg-white border-gray-100'} shadow-xl`}>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Procesados</p>
                <h4 className="text-6xl font-black text-blue-600 tracking-tighter">{total}</h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
import React, { useEffect, useState } from "react";
import axios from "axios";

const colors = ["#4CAF50", "#F44336", "#FFC107", "#2196F3", "#9C27B0", "#FF5722", "#607D8B"];

const PieChart = ({ data = [] , size = 220 }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <div>No hay datos para mostrar</div>;
  }

  // Convertir porcentaje (puede venir como '12.34%') a número
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

  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    background: `conic-gradient(${stops})`,
    display: 'inline-block'
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <div style={style} aria-hidden="true" />
      <div>
        {slices.map((s, i) => (
          <div key={s.estado} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: colors[i % colors.length] }} />
            <div style={{ fontSize: 14 }}>{s.estado}: <strong>{s.cantidad}</strong> ({s.porcentaje}%)</div>
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

  // Filtering state
  const [period, setPeriod] = useState('month'); // day|week|month|year
  const [dateDisplay, setDateDisplay] = useState(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`; // dd/mm/YYYY for the UI
  });
  const [dateError, setDateError] = useState(null);

  function parseDisplayToISO(disp) {
    if (!disp) return null;
    const m = /^\s*(\d{2})\/(\d{2})\/(\d{4})\s*$/.exec(disp);
    if (!m) return null;
    const dd = Number(m[1]), mm = Number(m[2]), yyyy = Number(m[3]);
    if (mm < 1 || mm > 12) return null;
    if (dd < 1 || dd > 31) return null;
    const dateObj = new Date(yyyy, mm - 1, dd);
    if (dateObj.getFullYear() !== yyyy || dateObj.getMonth() !== mm - 1 || dateObj.getDate() !== dd) return null;
    return `${String(yyyy).padStart(4,'0')}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`;
  }

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      setDateError(null);
      try {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const iso = parseDisplayToISO(dateDisplay);
        if (!iso) {
          setDateError('Formato de fecha inválido (dd/mm/YYYY)');
          setLoading(false);
          return;
        }
        const res = await axios.get(`${base}/api/stadistic`, { params: { period, date: iso } });
        if (!mounted) return;
        setTotal(res.data?.total_reportes ?? 0);
        setData(Array.isArray(res.data?.data) ? res.data.data.map(d => ({
          estado: d.estado,
          cantidad: Number(d.cantidad) || 0,
          porcentaje: Number(d.porcentaje || 0)
        })) : []);
      } catch (err) {
        console.error('Error fetching stats', err);
        setError(err?.response?.data?.message || err.message || 'Error al obtener estadísticas');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    return () => { mounted = false; };
  }, [period, dateDisplay]);

  function formatShort(dStr) {
    if (!dStr) return '';
    try {
      const d = new Date(dStr);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = String(d.getFullYear());
      return `${dd}/${mm}/${yyyy}`;
    } catch (e) { return dStr; }
  }

  function computeRange(period, dateStr) {
    const inputDate = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
    let from = new Date(inputDate);
    let to = new Date(inputDate);

    switch ((period || 'month').toLowerCase()) {
      case 'day':
        break;
      case 'week':
        const diff = (inputDate.getDay() + 6) % 7;
        from = new Date(inputDate);
        from.setDate(inputDate.getDate() - diff);
        to = new Date(from);
        to.setDate(from.getDate() + 6);
        break;
      case 'month':
        from = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);
        to = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 0);
        break;
      case 'year':
        from = new Date(inputDate.getFullYear(), 0, 1);
        to = new Date(inputDate.getFullYear(), 11, 31);
        break;
      default:
        from = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);
        to = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 0);
    }

    return { fromDisplay: formatShort(from.toISOString().slice(0,10)), toDisplay: formatShort(to.toISOString().slice(0,10)) };
  }

  let fromDisplay = '';
  let toDisplay = '';
  try {
    const range = computeRange(period, dateDisplay);
    fromDisplay = range.fromDisplay;
    toDisplay = range.toDisplay;
  } catch (e) {
    console.error('Error computing range:', e);
  }


  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }
    componentDidCatch(error, info) {
      console.error('ErrorBoundary caught:', error, info);
    }
    render() {
      if (this.state.hasError) {
        return <div className="p-6 text-red-600">Ocurrió un error al renderizar las estadísticas. Revisa la consola.</div>;
      }
      return this.props.children;
    }
  }

  return (
    <ErrorBoundary>
      <div>
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Estadísticas</h2>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-2">
        <div>
          <label className="block text-sm">Periodo</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-3 py-1 rounded border">
            <option value="day">Día</option>
            <option value="week">Semana</option>
            <option value="month">Mes</option>
            <option value="year">Año</option>
          </select>
        </div>

        <div>
          <label className="block text-sm">Fecha </label>
          <input type="text" placeholder="dd/mm/YYYY" value={dateDisplay} onChange={(e) => setDateDisplay(e.target.value)} className="px-3 py-1 rounded border" />
          {dateError && <div className="text-red-600 text-sm mt-1">{dateError}</div>}
        </div>

      </div>

      {loading && <div>Cargando estadísticas...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}> 
            <h3 className="text-lg font-semibold mb-2">Distribución por estado</h3>
            <PieChart data={data.map(d => ({ ...d, porcentaje: d.porcentaje }))} />
            <div className="mt-4 text-sm text-gray-400">Total reportes: <strong className={`text-${darkMode ? 'white' : 'gray-800'}`}>{total}</strong></div>
          </div>

          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}> 
            <h3 className="text-lg font-semibold mb-2">Detalles</h3>
            <div className="space-y-2">
              {data.length === 0 && <div>No hay datos</div>}
              {data.map((d, i) => (
                <div key={d.estado} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span style={{ width: 12, height: 12, background: colors[i % colors.length], display: 'inline-block' }}></span>
                    <span>{d.estado}</span>
                  </div>
                  <div>{d.cantidad} ({d.porcentaje.toFixed(2)}%)</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
};

export default Dashboard;

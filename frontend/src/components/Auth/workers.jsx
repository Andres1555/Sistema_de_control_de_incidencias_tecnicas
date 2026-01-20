import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import LoadingModal from "@/hooks/Modals/LoadingModal";
import "tailwindcss";
import { FiSun, FiMoon, FiHash, FiArrowLeft } from "react-icons/fi";

const WorkersLogin = () => {
  const [formData, setFormData] = useState({ ficha: "" });
  const navigate = useNavigate();
  
  const [darkMode, setDarkMode] = useState(() => {
    const t = localStorage.getItem('theme');
    if (t === null) return true;
    return t === 'dark';
  });

  const toggleTheme = () => setDarkMode((s) => {
    const next = !s;
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
    return next;
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, status: 'loading', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ficha) {
      setError('La ficha es obligatoria');
      return;
    }
    try {
      setIsLoading(true);
      setModalState({ isOpen: true, status: 'loading', message: 'Verificando ficha...' });

      const res = await axios.post("http://localhost:8080/api/workers/login", { ficha: formData.ficha });

      if (res.data?.token) localStorage.setItem('token', res.data.token);
      if (res.data?.user?.id) localStorage.setItem('userId', String(res.data.user.id));
      localStorage.setItem('role', 'worker');

      setModalState({ isOpen: true, status: 'success', message: 'Acceso permitido' });
      setError('');
    } catch (err) {
      console.error("Error en workers login:", err);
      const msg = err?.response?.data?.message || 'Ficha inválida';
      setError(msg);
      setModalState({ isOpen: true, status: 'error', message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    if (modalState.status === 'success') {
      setModalState((s) => ({ ...s, isOpen: false }));
      navigate('/workers');
      return;
    }
    setModalState((s) => ({ ...s, isOpen: false }));
  };

  return (
    /* --- CAMBIO: bg-blue-600 -> bg-slate-50 (Gris claro estándar) --- */
    <div className={`min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-500 ${
      darkMode ? "bg-[#0f172a]" : "bg-slate-50"
    }`}>
      
      {/* --- TARJETA: Ajuste de bordes y fondo para modo claro --- */}
      <div className={`w-full max-w-sm p-6 sm:p-10 rounded-3xl shadow-2xl relative transition-all duration-300 border ${
        darkMode ? "bg-[#1e293b] border-slate-700 text-white" : "bg-white border-gray-200 text-black"
      }`}>
        
        {/* Botón Volver */}
        <Link 
          to="/" 
          className={`absolute top-5 left-5 p-2 rounded-xl transition-colors ${
            darkMode ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-gray-500"
          }`}
        >
          <FiArrowLeft size={20} />
        </Link>

        {/* Botón de Tema */}
        <button 
          onClick={toggleTheme} 
          className="absolute top-5 right-5 p-2.5 rounded-xl hover:bg-slate-500/20 transition-colors z-10"
        >
          {darkMode ? <FiSun size={20} className="text-yellow-400" /> : <FiMoon size={20} className="text-blue-600" />}
        </button>

        <header className="text-center mt-4 mb-8">
            <h2 className={`text-2xl md:text-3xl font-black mb-2 uppercase tracking-tighter ${darkMode ? "text-blue-400" : "text-blue-700"}`}>
                Acceso Planta
            </h2>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                Ingresa tu número de ficha
            </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-2xl text-[10px] font-black text-center uppercase animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ml-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
              <FiHash size={14}/> Número de Ficha
            </label>
            <input
              type="text"
              name="ficha"
              placeholder="Ej: 45678"
              value={formData.ficha}
              onChange={(e) => setFormData({ ...formData, ficha: e.target.value })}
              className={`w-full px-5 py-4 text-center text-lg font-bold tracking-widest border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                darkMode ? "bg-[#334155] border-slate-600 text-white placeholder-slate-500" : "bg-gray-50 border-gray-200 text-black"
              }`}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-700 transform transition-all active:scale-95 shadow-xl shadow-blue-900/20 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        <footer className="mt-8 text-center">
            <Link to="/" className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
              darkMode ? "text-slate-500 hover:text-blue-400" : "text-gray-400 hover:text-blue-700"
            }`}>
              Regresar al Login General
            </Link>
        </footer>

        <LoadingModal 
          isOpen={modalState.isOpen} 
          status={modalState.status} 
          message={modalState.message} 
          onClose={handleModalClose} 
        />
      </div>
    </div>
  );
};

export default WorkersLogin;
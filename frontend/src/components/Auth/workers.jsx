import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import LoadingModal from "@/hooks/Modals/LoadingModal";
import "tailwindcss";
import { FiSun, FiMoon, FiHash, FiArrowLeft } from "react-icons/fi";

const WorkersLogin = () => {
  const [formData, setFormData] = useState({ ficha: "" });
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8091";

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');
  const toggleTheme = () => setDarkMode((s) => {
    const next = !s;
    localStorage.setItem('theme', next ? 'dark' : 'light');
    return next;
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, status: 'loading', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setModalState({ isOpen: true, status: 'loading', message: 'Verificando...' });
      const res = await axios.post(`${API_URL}/api/workers/login`, { ficha: formData.ficha });
      if (res.data?.token) localStorage.setItem('token', res.data.token);
      if (res.data?.user?.id) localStorage.setItem('userId', String(res.data.user.id));
      localStorage.setItem('role', 'worker');
      setModalState({ isOpen: true, status: 'success', message: 'Bienvenido' });
    } catch (err) {
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
    <div className={`min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-500 ${
      darkMode ? "bg-[#0f172a]" : "bg-slate-50"
    }`}>
      <div className={`w-full max-w-sm p-8 rounded-3xl shadow-2xl relative transition-all duration-300 border ${
        darkMode ? "bg-[#1e293b] border-slate-700 text-white" : "bg-white border-gray-200 text-black"
      }`}>
        <Link to="/" className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:bg-slate-500/10"><FiArrowLeft size={20} /></Link>
        <button onClick={toggleTheme} className="absolute top-5 right-5 p-2.5 rounded-xl hover:bg-slate-500/20 transition-colors"><FiSun size={20} className="text-yellow-400" /></button>
        <header className="text-center mt-4 mb-8">
            <h2 className={`text-2xl font-black uppercase tracking-tighter ${darkMode ? "text-blue-400" : "text-blue-700"}`}>Acceso Planta</h2>
        </header>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-[10px] font-black uppercase tracking-widest text-blue-500 ml-1">Ficha del Trabajador</label>
            <input type="text" placeholder="Ej: 45678" value={formData.ficha} onChange={(e) => setFormData({ ficha: e.target.value })} className={`w-full px-5 py-4 text-center text-lg font-bold border rounded-2xl outline-none ${darkMode ? "bg-[#334155] border-slate-600" : "bg-gray-50 border-gray-200"}`} required />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all active:scale-95 shadow-xl disabled:opacity-50">Entrar</button>
        </form>
        <LoadingModal isOpen={modalState.isOpen} status={modalState.status} message={modalState.message} onClose={handleModalClose} />
      </div>
    </div>
  );
};
export default WorkersLogin;
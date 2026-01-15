import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import LoadingModal from "@/hooks/Modals/LoadingModal";
import handleInputChange from "@/hooks/utils/handleInputChange";
import "tailwindcss";
import { FiSun, FiMoon, FiMail, FiLock } from "react-icons/fi";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === null) return true; 
    return savedTheme === 'dark';
  });

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const nextMode = !prev;
      localStorage.setItem('theme', nextMode ? 'dark' : 'light');
      return nextMode;
    });
  };

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, status: 'loading', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setModalState({ isOpen: true, status: 'loading', message: 'Iniciando sesión...' });

      const res = await axios.post("http://localhost:8080/api/auth/login", formData);

      if (res.data?.token) localStorage.setItem('token', res.data.token);
      if (res.data?.user?.rol) localStorage.setItem('role', res.data.user.rol);
      if (res.data?.user?.id) localStorage.setItem('userId', String(res.data.user.id));
      
      if (res.data?.user?.nombre) {
        const nombreCompleto = `${res.data.user.nombre} ${res.data.user.apellido || ""}`.trim();
        localStorage.setItem('userName', nombreCompleto);
      }

      setModalState({ isOpen: true, status: 'success', message: 'Login exitoso' });
      setError('');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Credenciales inválidas';
      setError(msg);
      setModalState({ isOpen: true, status: 'error', message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    if (modalState.status === 'success') {
      setModalState((s) => ({ ...s, isOpen: false }));
      navigate('/dashboard', { replace: true });
      return;
    }
    setModalState((s) => ({ ...s, isOpen: false }));
  };

  return (
    /* --- AJUSTE RESPONSIVE: min-h-screen y overflow-y-auto para móviles --- */
    <div className={`min-h-screen w-full flex items-center justify-center p-4 transition-colors duration-500 ${
      darkMode ? "bg-[#0f172a]" : "bg-blue-600"
    }`}>
      
      {/* --- TARJETA: Ajuste de ancho responsivo y sombras --- */}
      <div className={`w-full max-w-sm md:max-w-md p-6 sm:p-10 rounded-3xl shadow-2xl relative transition-all duration-300 border ${
        darkMode ? "bg-[#1e293b] border-slate-700 text-white" : "bg-white border-white text-black"
      }`}>
        
        {/* Botón de Tema con mayor área de toque para móvil */}
        <button 
          onClick={toggleTheme} 
          className="absolute top-5 right-5 p-2.5 rounded-xl hover:bg-slate-500/20 transition-colors z-10"
        >
          {darkMode ? <FiSun size={20} className="text-yellow-400" /> : <FiMoon size={20} className="text-blue-600" />}
        </button>

        <header className="text-center mb-8">
            <h2 className={`text-3xl md:text-4xl font-black mb-2 uppercase tracking-tighter ${darkMode ? "text-blue-400" : "text-blue-700"}`}>
                Bienvenido
            </h2>
            <p className={`text-[11px] sm:text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                Sistemas de Gestión de Fallas
            </p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-2xl text-[10px] sm:text-xs font-black text-center uppercase animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ml-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
              <FiMail size={12}/> Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={(e) => handleInputChange(e, setFormData)}
              className={`w-full px-5 py-3.5 text-sm border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                darkMode ? "bg-[#334155] border-slate-600 text-white placeholder-slate-500" : "bg-gray-50 border-gray-200 text-black"
              }`}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ml-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
              <FiLock size={12}/> Contraseña
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleInputChange(e, setFormData)}
              className={`w-full px-5 py-3.5 text-sm border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                darkMode ? "bg-[#334155] border-slate-600 text-white placeholder-slate-500" : "bg-gray-50 border-gray-200 text-black"
              }`}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs hover:bg-blue-700 transform transition-all active:scale-95 shadow-xl shadow-blue-900/20 disabled:opacity-50 mt-4"
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : 'Entrar al Panel'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700/30">
          <p className={`text-center text-[11px] sm:text-xs mb-6 font-medium ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
            ¿No tienes cuenta? <Link to="/signup" className="text-blue-500 font-black hover:underline ml-1">Regístrate aquí</Link>
          </p>
          
          <div className="flex items-center justify-center gap-3">
            <span className={`h-[1px] flex-1 ${darkMode ? "bg-slate-700" : "bg-gray-200"}`}></span>
            <Link to="/workers-login" className={`text-[9px] font-black uppercase tracking-widest hover:text-blue-500 transition-colors ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
              Acceso Planta
            </Link>
            <span className={`h-[1px] flex-1 ${darkMode ? "bg-slate-700" : "bg-gray-200"}`}></span>
          </div>
        </div>

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

export default Login;
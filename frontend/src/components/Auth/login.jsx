import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import LoadingModal from "@/hooks/Modals/LoadingModal";
import handleInputChange from "@/hooks/utils/handleInputChange";
import "tailwindcss";
import { FiSun, FiMoon } from "react-icons/fi";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  
  // --- MEJORA: Inicialización robusta del Dark Mode ---
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // Si no hay nada guardado, devolvemos true para que empiece en Dark Mode (Azul)
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

      // --- GUARDAR DATOS EN LOCALSTORAGE ---
      if (res.data?.token) localStorage.setItem('token', res.data.token);
      if (res.data?.user?.rol) localStorage.setItem('role', res.data.user.rol);
      if (res.data?.user?.id) localStorage.setItem('userId', String(res.data.user.id));
      
      // Guardar nombre completo para el perfil estilo Gmail
      if (res.data?.user?.nombre) {
        const nombreCompleto = `${res.data.user.nombre} ${res.data.user.apellido || ""}`.trim();
        localStorage.setItem('userName', nombreCompleto);
      }

      setModalState({ isOpen: true, status: 'success', message: 'Login exitoso' });
      setError('');
    } catch (err) {
      console.error("Error en login:", err);
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
    /* --- CAMBIO: Se aplica el azul marino (#0f172a) al fondo del login --- */
    <div className={`fixed inset-0 flex items-center justify-center transition-colors duration-500 ${
      darkMode ? "bg-[#0f172a]" : "bg-blue-600"
    }`}>
      
      {/* --- CAMBIO: Se aplica el azul slate (#1e293b) a la tarjeta --- */}
      <div className={`p-8 rounded-2xl shadow-2xl w-full max-w-md mx-auto text-center relative transition-all duration-300 border ${
        darkMode ? "bg-[#1e293b] border-slate-700 text-white" : "bg-white border-white text-black"
      }`}>
        
        <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-500/20 transition-colors">
          {darkMode ? <FiSun size={20} className="text-yellow-400" /> : <FiMoon size={20} className="text-blue-600" />}
        </button>

        <h2 className={`text-3xl font-bold mb-2 ${darkMode ? "text-blue-400" : "text-blue-700"}`}>Bienvenido</h2>
        <p className={`text-sm mb-8 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Ingresa tus credenciales para continuar</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl text-xs font-bold animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left mx-auto">
          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1 ml-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Correo Electrónico</label>
            <input
              type="email"
              name="email"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={(e) => handleInputChange(e, setFormData)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                darkMode ? "bg-[#334155] border-slate-600 text-white placeholder-slate-400" : "bg-gray-50 border-gray-300 text-black"
              }`}
              required
            />
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase tracking-widest mb-1 ml-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Contraseña</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleInputChange(e, setFormData)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                darkMode ? "bg-[#334155] border-slate-600 text-white placeholder-slate-400" : "bg-gray-50 border-gray-300 text-black"
              }`}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transform transition-all active:scale-95 shadow-lg disabled:opacity-50 mt-2"
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : 'Entrar al Panel'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700/30 space-y-4">
          <p className={`text-xs ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
            ¿No tienes cuenta? <Link to="/signup" className="text-blue-500 font-bold hover:underline">Regístrate aquí</Link>
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <span className={`h-[1px] flex-1 ${darkMode ? "bg-slate-700" : "bg-gray-200"}`}></span>
            <Link to="/workers-login" className={`text-[10px] font-bold uppercase tracking-tighter hover:text-blue-500 transition-colors ${darkMode ? "text-slate-500" : "text-gray-400"}`}>
              Acceso Trabajadores
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
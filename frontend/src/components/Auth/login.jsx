import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import LoadingModal from "@/hooks/Modals/LoadingModal";
import handleInputChange from "@/hooks/utils/handleInputChange";
import "tailwindcss";
import { FiSun, FiMoon } from "react-icons/fi";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  
  // Estado para el Modo Oscuro
  const [darkMode, setDarkMode] = useState(() => {
    const t = localStorage.getItem('theme');
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return true;
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
    try {
      setIsLoading(true);
      setModalState({ isOpen: true, status: 'loading', message: 'Iniciando sesión...' });

      // Petición al backend
      const res = await axios.post("http://localhost:8080/api/auth/login", formData);

      // Guardar sesión en localStorage
      if (res.data?.token) localStorage.setItem('token', res.data.token);
      if (res.data?.user?.rol) localStorage.setItem('role', res.data.user.rol);
      if (res.data?.user?.id) localStorage.setItem('userId', String(res.data.user.id));

      // Éxito: Abrir modal
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

  // ESTA FUNCIÓN ES LA QUE MANEJA LA REDIRECCIÓN
  const handleModalClose = () => {
    if (modalState.status === 'success') {
      setModalState((s) => ({ ...s, isOpen: false }));
      
      // CAMBIO CLAVE: Redirigir a /dashboard (donde está tu Mainpage)
      // Usamos replace: true para que no puedan volver atrás al login con el botón del navegador
      navigate('/dashboard', { replace: true });
      return;
    }
    setModalState((s) => ({ ...s, isOpen: false }));
  };

  return (
    <div className={`${darkMode ? "fixed inset-0 bg-gray-900" : "fixed inset-0 bg-blue-600"} flex items-center justify-center transition-colors duration-300`}>
      <div className={`${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-black"} p-8 rounded-xl shadow-lg w-full max-w-md mx-auto text-center relative`}>
        
        {/* Toggle de Tema */}
        <button onClick={toggleTheme} className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-500/20 transition-colors">
          {darkMode ? <FiSun size={20} className="text-yellow-400" /> : <FiMoon size={20} className="text-blue-600" />}
        </button>

        <h2 className="text-3xl font-bold text-blue-600 mb-2">Bienvenido</h2>
        <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ingresa tus credenciales para continuar</p>

        {error && (
          <div className="mb-4 p-3 text-sm bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left mx-auto" style={{ maxWidth: "380px" }}>
          <div>
            <label className="block text-xs font-bold uppercase mb-1 ml-1 opacity-70">Correo Electrónico</label>
            <input
              type="email"
              name="email"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={(e) => handleInputChange(e, setFormData)}
              className={`${
                darkMode ? "bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500" : "bg-white text-black border-gray-300 focus:border-blue-600"
              } w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all`}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1 ml-1 opacity-70">Contraseña</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleInputChange(e, setFormData)}
              className={`${
                darkMode ? "bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-500" : "bg-white text-black border-gray-300 focus:border-blue-600"
              } w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all`}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transform transition-all active:scale-95 shadow-lg disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : 'Ingresar al Panel'}
          </button>
        </form>

        <div className="mt-8 space-y-3">
          <p className="text-sm text-gray-500">
            ¿No tienes cuenta? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Regístrate aquí</Link>
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="h-[1px] w-10 bg-gray-500/30"></span>
            <Link to="/workers-login" className="text-xs font-medium text-gray-400 hover:text-blue-500 transition-colors">
              Ingreso para Trabajadores
            </Link>
            <span className="h-[1px] w-10 bg-gray-500/30"></span>
          </div>
        </div>

        {/* Modal de Carga / Éxito / Error */}
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
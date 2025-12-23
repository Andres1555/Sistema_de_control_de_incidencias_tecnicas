import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import LoadingModal from "@/hooks/Modals/LoadingModal";
import handleInputChange from "@/hooks/utils/handleInputChange";
import "tailwindcss";
import { FiSun, FiMoon } from "react-icons/fi";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();
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

      const res = await axios.post("http://localhost:8080/api/auth/login", formData);

      // Guardar token y rol en localStorage
      if (res.data?.token) localStorage.setItem('token', res.data.token);
      if (res.data?.user?.rol) localStorage.setItem('role', res.data.user.rol);

      // Mostrar modal de éxito y navegar al cerrar
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
      navigate('/');
      return;
    }
    setModalState((s) => ({ ...s, isOpen: false }));
  };

  return (
    <div className={`${darkMode ? "fixed inset-0 bg-gray-900" : "fixed inset-0 bg-blue-600"} flex items-center justify-center`}>
      <div className={`${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-black"} p-8 rounded-xl shadow-lg w-full max-w-md mx-auto text-center relative`}>
        <button onClick={toggleTheme} className="absolute top-3 right-3 p-1 rounded opacity-90">
          {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Login</h2>
        {error && <div className="mb-4 text-sm text-red-400">{error}</div>}
  <form onSubmit={handleSubmit} className="space-y-4 text-left mx-auto" style={{ maxWidth: "380px" }}>
          <input
            type="email"
            name="email"
            placeholder="Correo"
            value={formData.email}
            onChange={(e) => handleInputChange(e, setFormData)}
            className={`${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white text-black border-gray-300"} w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600`}
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={(e) => handleInputChange(e, setFormData)}
            className={`${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white text-black border-gray-300"} w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600`}
          />
          <button
            type="submit"
            className="w-full bg-blue-700 text-black py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
        <LoadingModal isOpen={modalState.isOpen} status={modalState.status} message={modalState.message} onClose={handleModalClose} />
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tienes cuenta? <Link to="/signup" className="text-blue-700 font-semibold hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
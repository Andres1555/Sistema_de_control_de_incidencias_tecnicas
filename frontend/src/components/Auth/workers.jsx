import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingModal from "@/hooks/Modals/LoadingModal";
import "tailwindcss";
import { FiSun, FiMoon } from "react-icons/fi";

const WorkersLogin = () => {
  const [formData, setFormData] = useState({ ficha: "" });
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
    <div className={`${darkMode ? "fixed inset-0 bg-gray-900" : "fixed inset-0 bg-blue-600"} flex items-center justify-center`}>
      <div className={`${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-black"} p-8 rounded-xl shadow-lg w-full max-w-md mx-auto text-center relative`}>
        <button onClick={toggleTheme} className="absolute top-3 right-3 p-1 rounded opacity-90">
          {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Ingreso - Trabajador</h2>
        {error && <div className="mb-4 text-sm text-red-400">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 text-left mx-auto" style={{ maxWidth: "380px" }}>
          <input
            type="text"
            name="ficha"
            placeholder="Ficha"
            value={formData.ficha}
            onChange={(e) => setFormData({ ...formData, ficha: e.target.value })}
            className={`${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white text-black border-gray-300"} w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600`}
          />

          <button
            type="submit"
            className="w-full bg-blue-700 text-black py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
        <LoadingModal isOpen={modalState.isOpen} status={modalState.status} message={modalState.message} onClose={handleModalClose} />
      </div>
    </div>
  );
};

export default WorkersLogin;

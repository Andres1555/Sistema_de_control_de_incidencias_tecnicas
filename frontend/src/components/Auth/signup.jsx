import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import LoadingModal from "@/hooks/Modals/LoadingModal";
import handleInputChange from "@/hooks/utils/handleInputChange";
import "tailwindcss";
import { FiSun, FiMoon } from "react-icons/fi";

const SignUp = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    ficha: "",
    telefono: "",
    C_I: "",
    rol: "",
    especializacion: "",
    numero_maquina: "",
    extension: "",
    password: "",
  });

  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

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
    setError('');

    const listaSpecs = formData.especializacion
      .split(",")
      .map(s => s.trim())
      .filter(s => s !== "");

    if (listaSpecs.length === 0) {
      setError('Escriba al menos una especialidad');
      return;
    }

    try {
      setIsLoading(true);
      setModalState({ isOpen: true, status: 'loading', message: 'Procesando registro...' });

      const userPayload = {
        ci: Number(formData.C_I),
        nombre: String(formData.nombre),
        apellido: String(formData.apellido),
        email: String(formData.correo),
        password: String(formData.password),
        telefono: Number(formData.telefono),
        ficha: Number(formData.ficha),
        rol: String(formData.rol),
        extension: Number(formData.extension),
      };

      const base = "http://localhost:8080/api";

      const userRes = await axios.post(`${base}/users`, userPayload);
      const userId = userRes.data?.id || userRes.data?.user?.id || userRes.data?.data?.id;

      if (!userId) throw new Error("El servidor no devolvió el ID del usuario.");

      if (formData.numero_maquina) {
        try {
          await axios.post(`${base}/machines`, { 
            id_user: Number(userId), 
            nro_maquina: Number(formData.numero_maquina) 
          });
        } catch (e) { console.warn(e); }
      }

      for (const nombre of listaSpecs) {
        try {
          const specRes = await axios.post(`${base}/specializations`, { nombre });
          const specId = specRes.data?.id || specRes.data?.data?.id;
          if (specId) {
            await axios.post(`${base}/specialization_users`, { 
              id_user: Number(userId), 
              id_specia: Number(specId) 
            });
          }
        } catch (e) { console.warn(e); }
      }

      // ÉXITO: Se activa el modal
      setModalState({ 
        isOpen: true, 
        status: 'success', 
        message: '¡Registro completado con éxito!' 
      });

    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      setModalState({ isOpen: true, status: 'error', message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // --- FUNCIÓN DE CIERRE DE MODAL CON REDIRECCIÓN CORREGIDA ---
  const handleModalClose = () => {
    const wasSuccess = modalState.status === 'success';
    setModalState(prev => ({ ...prev, isOpen: false }));
    
    // Si el registro fue bien, mandamos a la raíz "/" (donde está tu Login)
    if (wasSuccess) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className={`${darkMode ? "fixed inset-0 bg-gray-900" : "fixed inset-0 bg-blue-600"} flex items-center justify-center overflow-y-auto p-4`}>
      <div className={`${darkMode ? "bg-[#1a222f] text-gray-100" : "bg-white text-black"} p-8 rounded-xl shadow-lg w-full max-w-2xl mx-auto text-center relative transition-all duration-300`}>
        
        <button type="button" onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-500/20">
          {darkMode ? <FiSun size={20} className="text-yellow-400" /> : <FiMoon size={20} className="text-blue-600" />}
        </button>

        <h2 className="text-3xl font-bold text-blue-600 mb-2 uppercase">Crear Cuenta</h2>
        <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Regístrate para acceder al sistema</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-blue-500 ml-1">Nombre</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"} w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600`} required />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-blue-500 ml-1">Apellido</label>
                <input type="text" name="apellido" value={formData.apellido} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"} w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600`} required />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-blue-500 ml-1">Correo Electrónico</label>
                <input type="email" name="correo" value={formData.correo} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"} w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600`} required />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-blue-500 ml-1">Contraseña</label>
                <input type="password" name="password" value={formData.password} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"} w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600`} required />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-blue-500 ml-1">Cédula</label>
                <input type="text" name="C_I" value={formData.C_I} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"} w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600`} required />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-blue-500 ml-1">Ficha</label>
                <input type="text" name="ficha" value={formData.ficha} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"} w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600`} required />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-blue-500 ml-1">Rol</label>
                <select name="rol" value={formData.rol} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"} w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600`} required>
                    <option value="">Seleccione...</option>
                    <option value="tecnico">Técnico</option>
                    <option value="administrador">Administrador</option>
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-blue-500 ml-1">Especialidades</label>
                <input type="text" name="especializacion" placeholder="redes, sql..." value={formData.especializacion} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"} w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600`} required />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-blue-500 ml-1">Nro Máquina</label>
                <input type="number" name="numero_maquina" value={formData.numero_maquina} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"} w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600`} />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-blue-500 ml-1">Teléfono</label>
                <input type="text" name="telefono" value={formData.telefono} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"} w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600`} required />
            </div>
            <div className="space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold uppercase text-blue-500 ml-1">Extensión</label>
                <input type="text" name="extension" value={formData.extension} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"} w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-600`} required />
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-4 uppercase">
            {isLoading ? 'Registrando...' : 'Finalizar Registro'}
          </button>
        </form>

        <LoadingModal 
          isOpen={modalState.isOpen} 
          status={modalState.status} 
          message={modalState.message} 
          onClose={handleModalClose} 
        />

        <p className="mt-6 text-center text-sm">
            {/* Redirección manual corregida a la raíz "/" */}
          ¿Ya tienes cuenta? <Link to="/" className="text-blue-600 font-bold hover:underline transition-all">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
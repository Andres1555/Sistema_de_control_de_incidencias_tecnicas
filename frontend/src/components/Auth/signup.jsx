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

  const handleModalClose = () => {
    const wasSuccess = modalState.status === 'success';
    setModalState(prev => ({ ...prev, isOpen: false }));
    if (wasSuccess) {
      navigate('/', { replace: true });
    }
  };

  return (
    // CAMBIO: Se eliminó fixed y se usó min-h-screen con flex-col para permitir scroll natural en móviles
    <div className={`${darkMode ? "bg-gray-900" : "bg-blue-600"} min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-8 transition-colors duration-300`}>
      
      {/* CAMBIO: Se ajustó el max-w y se añadió overflow-hidden */}
      <div className={`${darkMode ? "bg-[#1a222f] text-gray-100" : "bg-white text-black"} 
        w-full max-w-3xl rounded-2xl shadow-2xl relative transition-all duration-300 overflow-hidden`}>
        
        {/* Botón de tema */}
        <button type="button" onClick={toggleTheme} className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-500/20 transition-colors">
          {darkMode ? <FiSun size={20} className="text-yellow-400" /> : <FiMoon size={20} className="text-blue-600" />}
        </button>

        {/* Contenido del Formulario */}
        <div className="p-5 sm:p-8 md:p-10">
          <header className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-blue-600 mb-2 uppercase tracking-tight">Crear Cuenta</h2>
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Completa tus datos para unirte al sistema</p>
          </header>
          
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-[11px] sm:text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* GRID RESPONSIVE: 1 columna en móvil, 2 en tablets/escritorio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 sm:gap-y-4 text-left">
              
              <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-wider">Nombre</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300"} w-full p-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all`} required />
              </div>

              <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-wider">Apellido</label>
                  <input type="text" name="apellido" value={formData.apellido} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300"} w-full p-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all`} required />
              </div>

              <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-wider">Correo Electrónico</label>
                  <input type="email" name="correo" value={formData.correo} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300"} w-full p-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all`} required />
              </div>

              <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-wider">Contraseña</label>
                  <input type="password" name="password" value={formData.password} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300"} w-full p-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all`} required />
              </div>

              <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-wider">Cédula</label>
                  <input type="text" name="C_I" value={formData.C_I} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300"} w-full p-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all`} required />
              </div>

              <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-wider">Ficha</label>
                  <input type="text" name="ficha" value={formData.ficha} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300"} w-full p-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all`} required />
              </div>

              <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-wider">Rol</label>
                  <select name="rol" value={formData.rol} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300"} w-full p-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer`} required>
                      <option value="">Seleccione...</option>
                      <option value="tecnico">Técnico</option>
                      <option value="administrador">Administrador</option>
                  </select>
              </div>

              <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-wider">Especialidades</label>
                  <input type="text" name="especializacion" placeholder="redes, sql..." value={formData.especializacion} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300"} w-full p-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all`} required />
              </div>

              <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-wider">Nro Máquina</label>
                  <input type="number" name="numero_maquina" value={formData.numero_maquina} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300"} w-full p-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all`} />
              </div>

              <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-wider">Teléfono</label>
                  <input type="text" name="telefono" value={formData.telefono} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300"} w-full p-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all`} required />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-1 tracking-wider">Extensión</label>
                  <input type="text" name="extension" value={formData.extension} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300"} w-full p-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all`} required />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-black hover:bg-blue-700 transition-all shadow-xl active:scale-95 disabled:opacity-50 mt-6 uppercase tracking-widest text-sm">
              {isLoading ? 'Procesando...' : 'Finalizar Registro'}
            </button>
          </form>

          <footer className="mt-8 text-center">
            <p className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              ¿Ya tienes cuenta? <Link to="/" className="text-blue-600 font-black hover:underline transition-all ml-1">Inicia sesión</Link>
            </p>
          </footer>
        </div>
      </div>

      <LoadingModal 
        isOpen={modalState.isOpen} 
        status={modalState.status} 
        message={modalState.message} 
        onClose={handleModalClose} 
      />
    </div>
  );
};

export default SignUp;
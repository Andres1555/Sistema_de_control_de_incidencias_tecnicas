import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import LoadingModal from "@/hooks/Modals/LoadingModal";
import handleInputChange from "@/hooks/utils/handleInputChange";
import "tailwindcss";
import { FiSun, FiMoon } from "react-icons/fi";

const SignUp = () => {
  const [formData, setFormData] = useState({
    nombre: "", apellido: "", correo: "", ficha: "", telefono: "", C_I: "", rol: "tecnico", especializacion: "", numero_maquina: "", extension: "", password: "",
  });

  const [error, setError] = useState(''); 
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const toggleTheme = () => setDarkMode((s) => {
    const next = !s;
    localStorage.setItem('theme', next ? 'dark' : 'light');
    return next;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, status: 'loading', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const required = ["nombre","apellido","correo","ficha","telefono","C_I","rol","especializacion","extension","password"];
    for (const k of required) {
      if (!formData[k]) {
        setModalState({ isOpen: true, status: 'error', message: 'Complete todos los campos obligatorios.' });
        return;
      }
    }

    try {
      setIsLoading(true);
      setModalState({ isOpen: true, status: 'loading', message: 'Registrando...' });
      const base = `${API_URL}/api`;

      const userRes = await axios.post(`${base}/users`, {
        ci: Number(formData.C_I), nombre: formData.nombre, apellido: formData.apellido,
        email: formData.correo, password: formData.password, telefono: String(formData.telefono),
        ficha: Number(formData.ficha), rol: formData.rol, extension: Number(formData.extension)
      });

      const userId = userRes.data?.data?.id || userRes.data?.id || userRes.data?.user?.id;

      if (userId) {
        if (formData.numero_maquina) await axios.post(`${base}/machines`, { id_user: userId, nro_maquina: String(formData.numero_maquina) });
        const specs = formData.especializacion.split(",").map(s => s.trim()).filter(s => s !== "");
        for (const s of specs) {
          const sRes = await axios.post(`${base}/specializations`, { nombre: s });
          const sId = sRes.data?.id || sRes.data?.data?.id;
          if (sId) await axios.post(`${base}/specialization_users`, { id_user: userId, id_specia: sId });
        }
      }

      setModalState({ isOpen: true, status: 'success', message: 'Registro exitoso.' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Error en el servidor';
      setError(msg);
      setModalState({ isOpen: true, status: 'error', message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    const success = modalState.status === 'success';
    setModalState(prev => ({ ...prev, isOpen: false }));
    if (success) navigate('/'); 
  };

  // 1. Estilo para la caja (Background)
  const inputBaseClass = `p-2.5 border rounded-xl w-full outline-none transition-all shadow-sm
    ${darkMode 
      ? "bg-gray-800 border-gray-700 placeholder-gray-500" 
      : "bg-white border-gray-300 placeholder-gray-400"
    } focus:ring-2 focus:ring-blue-500/50`;

  // 2. Estilo para el texto (FORZAR BLANCO SÓLIDO)
  const textStyle = {
    color: darkMode ? '#ffffff' : '#000000',
    WebkitTextFillColor: darkMode ? '#ffffff' : '#000000',
  };

  return (
    <div className={`${darkMode ? "bg-gray-900" : "bg-slate-100"} min-h-screen flex items-center justify-center p-4 transition-colors`}>
      
      {/* CSS Inyectado para evitar que el autocompletado del navegador cambie el color a negro */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-text-fill-color: ${darkMode ? 'white' : 'black'} !important;
          -webkit-box-shadow: 0 0 0px 1000px ${darkMode ? '#1f2937' : 'white'} inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <div className={`${darkMode ? "bg-[#1a222f] text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"} w-full max-w-3xl rounded-2xl shadow-2xl relative border overflow-hidden`}>
        
        <button type="button" onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-500/10 transition-colors">
          {darkMode ? <FiSun size={20} className="text-yellow-400" /> : <FiMoon size={20} className="text-blue-600" />}
        </button>

        <div className="p-8 text-center">
          <h2 className="text-3xl font-black text-blue-600 mb-8 uppercase tracking-tight">Crear Cuenta</h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <input style={textStyle} type="text" name="nombre" placeholder="Nombre" onChange={(e) => handleInputChange(e, setFormData)} className={inputBaseClass} required />
            <input style={textStyle} type="text" name="apellido" placeholder="Apellido" onChange={(e) => handleInputChange(e, setFormData)} className={inputBaseClass} required />
            <input style={textStyle} type="email" name="correo" placeholder="Email" onChange={(e) => handleInputChange(e, setFormData)} className={inputBaseClass} required />
            <input style={textStyle} type="password" name="password" placeholder="Contraseña" onChange={(e) => handleInputChange(e, setFormData)} className={inputBaseClass} required />
            <input style={textStyle} type="number" name="C_I" placeholder="Cédula" onChange={(e) => handleInputChange(e, setFormData)} className={inputBaseClass} required />
            <input style={textStyle} type="number" name="ficha" placeholder="Ficha" onChange={(e) => handleInputChange(e, setFormData)} className={inputBaseClass} required />
            
            <select style={textStyle} name="rol" onChange={(e) => handleInputChange(e, setFormData)} className={inputBaseClass}>
              <option value="tecnico" className={darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}>Técnico</option>
              <option value="administrador" className={darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}>Administrador</option>
            </select>

            <input style={textStyle} type="text" name="especializacion" placeholder="Especialidades" onChange={(e) => handleInputChange(e, setFormData)} className={inputBaseClass} required />
            <input style={textStyle} type="text" name="numero_maquina" placeholder="Máquina (opcional)" onChange={(e) => handleInputChange(e, setFormData)} className={inputBaseClass} />
            <input style={textStyle} type="number" name="telefono" placeholder="Teléfono" onChange={(e) => handleInputChange(e, setFormData)} className={inputBaseClass} required />
            <input style={textStyle} type="number" name="extension" placeholder="Extensión" onChange={(e) => handleInputChange(e, setFormData)} className={inputBaseClass} required />
            
            <div className="md:col-span-2">
              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all active:scale-95 shadow-lg mt-4 disabled:opacity-50">
                Finalizar Registro
              </button>
            </div>
          </form>

          <p className="mt-6 text-xs font-bold text-gray-500">
            ¿Ya tienes cuenta? <Link to="/" className="text-blue-600 hover:underline ml-1">Inicia sesión</Link>
          </p>
        </div>
      </div>

      {/* MODAL MANTENIDO TAL CUAL */}
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
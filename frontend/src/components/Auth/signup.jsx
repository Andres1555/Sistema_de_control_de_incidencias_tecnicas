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

  const [isLoading, setIsLoading] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, status: 'loading', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validación de campos vacíos
    const required = ["nombre","apellido","correo","ficha","telefono","C_I","rol","especializacion","extension","password"];
    for (const k of required) {
      if (!formData[k]) {
        setModalState({ isOpen: true, status: 'error', message: 'Complete todos los campos obligatorios.' });
        return;
      }
    }

    // 2. Validación de Teléfono (Simple)
    const phoneStr = formData.telefono.toString().trim();
    if (!/^\d+$/.test(phoneStr) || phoneStr.length < 10 || phoneStr.length > 11) {
      setModalState({ isOpen: true, status: 'error', message: 'Número de teléfono inválido.' });
      return;
    }

    try {
      setIsLoading(true);
      setModalState({ isOpen: true, status: 'loading', message: 'Validando datos...' });

      const base = "http://localhost:8080/api";

      // 3. Verificación de duplicados
      const resCheck = await axios.get(`${base}/users`);
      const users = Array.isArray(resCheck.data) ? resCheck.data : (resCheck.data.users || []);

      if (users.some(u => Number(u.ficha) === Number(formData.ficha))) {
        setModalState({ isOpen: true, status: 'error', message: 'Esta ficha ya se encuentra registrada.' });
        setIsLoading(false);
        return;
      }

      if (users.some(u => Number(u.C_I || u.ci) === Number(formData.C_I))) {
        setModalState({ isOpen: true, status: 'error', message: 'Esta cédula ya se encuentra registrada.' });
        setIsLoading(false);
        return;
      }

      // 4. Registro
      setModalState({ isOpen: true, status: 'loading', message: 'Procesando registro...' });

      const userPayload = {
        ci: Number(formData.C_I),
        nombre: String(formData.nombre),
        apellido: String(formData.apellido),
        email: String(formData.correo),
        password: String(formData.password),
        telefono: Number(phoneStr),
        ficha: Number(formData.ficha),
        rol: String(formData.rol),
        extension: Number(formData.extension),
      };

      const userRes = await axios.post(`${base}/users`, userPayload);
      const userId = userRes.data?.id || userRes.data?.user?.id || userRes.data?.data?.id;

      if (!userId) throw new Error("Error al procesar el registro.");

      if (formData.numero_maquina) {
        await axios.post(`${base}/machines`, { id_user: userId, nro_maquina: Number(formData.numero_maquina) });
      }

      const specs = formData.especializacion.split(",").map(s => s.trim()).filter(s => s !== "");
      for (const s of specs) {
        const sRes = await axios.post(`${base}/specializations`, { nombre: s });
        const sId = sRes.data?.id || sRes.data?.data?.id;
        if (sId) await axios.post(`${base}/specialization_users`, { id_user: userId, id_specia: sId });
      }

      setModalState({ isOpen: true, status: 'success', message: 'Registro exitoso.' });

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error al procesar el registro.';
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

  const inputClass = `${darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-300 text-black"} w-full p-2.5 text-sm border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all`;
  const labelClass = "text-[10px] font-black uppercase text-blue-500 ml-1 tracking-wider";

  return (
    <div className={`${darkMode ? "bg-gray-900" : "bg-slate-50"} min-h-screen flex items-center justify-center p-4 transition-colors duration-300`}>
      <div className={`${darkMode ? "bg-[#1a222f] text-gray-100 border-gray-700" : "bg-white text-black border-gray-200"} 
        w-full max-w-3xl rounded-2xl shadow-2xl relative transition-all duration-300 overflow-hidden border`}>
        
        <button type="button" onClick={toggleTheme} className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-500/20 transition-colors">
          {darkMode ? <FiSun size={20} className="text-yellow-400" /> : <FiMoon size={20} className="text-blue-600" />}
        </button>

        <div className="p-8">
          <header className="text-center mb-8">
            <h2 className="text-3xl font-black text-blue-600 mb-2 uppercase tracking-tight">Crear Cuenta</h2>
            <p className="text-xs font-bold text-gray-500 uppercase opacity-60">Complete los datos de registro</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-left">
              <div className="space-y-1">
                  <label className={labelClass}>Nombre</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={(e) => handleInputChange(e, setFormData)} className={inputClass} required />
              </div>
              <div className="space-y-1">
                  <label className={labelClass}>Apellido</label>
                  <input type="text" name="apellido" value={formData.apellido} onChange={(e) => handleInputChange(e, setFormData)} className={inputClass} required />
              </div>
              <div className="space-y-1">
                  <label className={labelClass}>Correo Electrónico</label>
                  <input type="email" name="correo" value={formData.correo} onChange={(e) => handleInputChange(e, setFormData)} className={inputClass} required />
              </div>
              <div className="space-y-1">
                  <label className={labelClass}>Contraseña</label>
                  <input type="password" name="password" value={formData.password} onChange={(e) => handleInputChange(e, setFormData)} className={inputClass} required />
              </div>
              <div className="space-y-1">
                  <label className={labelClass}>Cédula</label>
                  <input type="number" name="C_I" value={formData.C_I} onChange={(e) => handleInputChange(e, setFormData)} className={inputClass} required />
              </div>
              <div className="space-y-1">
                  <label className={labelClass}>Ficha</label>
                  <input type="number" name="ficha" value={formData.ficha} onChange={(e) => handleInputChange(e, setFormData)} className={inputClass} required />
              </div>
              <div className="space-y-1">
                  <label className={labelClass}>Rol</label>
                  <select name="rol" value={formData.rol} onChange={(e) => handleInputChange(e, setFormData)} className={inputClass} required>
                      <option value="">Seleccione...</option>
                      <option value="tecnico">Técnico</option>
                      <option value="administrador">Administrador</option>
                  </select>
              </div>
              <div className="space-y-1">
                  <label className={labelClass}>Especialidades</label>
                  <input type="text" name="especializacion" placeholder="Separar por comas" value={formData.especializacion} onChange={(e) => handleInputChange(e, setFormData)} className={inputClass} required />
              </div>
              <div className="space-y-1">
                  <label className={labelClass}>Teléfono</label>
                  <input type="text" name="telefono" placeholder="04121234567" value={formData.telefono} onChange={(e) => handleInputChange(e, setFormData)} className={inputClass} required />
              </div>
              <div className="space-y-1">
                  <label className={labelClass}>Extensión</label>
                  <input type="number" name="extension" value={formData.extension} onChange={(e) => handleInputChange(e, setFormData)} className={inputClass} required />
              </div>
              <div className="md:col-span-2 space-y-1">
                  <label className={labelClass}>Nro Máquina Asignada (Opcional)</label>
                  <input type="number" name="numero_maquina" value={formData.numero_maquina} onChange={(e) => handleInputChange(e, setFormData)} className={inputClass} />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl active:scale-95 disabled:opacity-50 mt-6 uppercase tracking-[0.2em] text-xs">
              Finalizar Registro
            </button>
          </form>

          <footer className="mt-8 text-center border-t border-gray-500/20 pt-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              ¿Ya tienes cuenta? <Link to="/" className="text-blue-600 hover:underline ml-1">Inicia sesión</Link>
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
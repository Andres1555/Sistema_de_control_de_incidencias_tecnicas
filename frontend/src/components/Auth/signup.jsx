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
  
  const [darkMode, setDarkMode] = useState(() => {
    const t = localStorage.getItem('theme');
    return t === 'dark';
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
    setError(''); // Limpiar errores previos

    // 1. Validaciones básicas
    const required = ["nombre","apellido","correo","ficha","telefono","C_I","rol","especializacion","extension","password"];
    for (const k of required) {
      if (!formData[k] && formData[k] !== 0) {
        setError(`El campo ${k} es obligatorio`);
        return;
      }
    }

    try {
      setIsLoading(true);
      setModalState({ isOpen: true, status: 'loading', message: 'Procesando registro...' });

      const payload = {
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

      // 2. Crear la especialización
      await axios.post("http://localhost:8080/api/specializations", { nombre: String(formData.especializacion) });

      // 3. Crear el usuario
      const userRes = await axios.post("http://localhost:8080/api/users", payload);
      
      // Intentamos obtener el ID directamente de la respuesta del servidor si es posible
      // Si tu backend devuelve el objeto creado, úsalo. Si no, mantenemos tu búsqueda.
      let userId = userRes.data?.id || userRes.data?.user?.id;

      if (!userId) {
        const usersRes = await axios.get('http://localhost:8080/api/users');
        const found = usersRes.data.find(u => u.correo === payload.email);
        userId = found?.id;
      }

      if (userId) {
        // 4. Crear máquina
        if (formData.numero_maquina) {
          await axios.post('http://localhost:8080/api/machines', { 
            id_user: Number(userId), 
            nro_maquina: Number(formData.numero_maquina) 
          });
        }

        // 5. Relacionar Especialización
        const specsRes = await axios.get('http://localhost:8080/api/specializations');
        const foundSpec = specsRes.data.find(s => s.nombre === String(formData.especializacion));
        if (foundSpec) {
          await axios.post('http://localhost:8080/api/specialization_users', { 
            id_user: Number(userId), 
            id_specia: Number(foundSpec.id) 
          });
        }
      }

      // 6. ÉXITO: Mostramos el modal de éxito
      setModalState({ 
        isOpen: true, 
        status: 'success', 
        message: '¡Registro completado con éxito! Ya puedes iniciar sesión.' 
      });

    } catch (err) {
      console.error("Error en registro:", err);
      const msg = err?.response?.data?.message || 'Error al registrarse. Inténtalo de nuevo.';
      setError(msg);
      setModalState({ isOpen: true, status: 'error', message: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // Esta función se encarga de la redirección al cerrar el modal
  const handleModalClose = () => {
    const wasSuccess = modalState.status === 'success';
    setModalState((s) => ({ ...s, isOpen: false }));
    
    if (wasSuccess) {
      navigate('/login'); // Redirigir a login solo si fue exitoso
    }
  };

  return (
    <div className={`${darkMode ? "fixed inset-0 bg-gray-900" : "fixed inset-0 bg-blue-600"} flex items-center justify-center overflow-y-auto p-4`}>
      <div className={`${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-black"} p-8 rounded-xl shadow-lg w-full max-w-2xl mx-auto text-center relative transition-all duration-300`}>
        
        <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-500/20 transition-colors">
          {darkMode ? <FiSun size={20} className="text-yellow-400" /> : <FiMoon size={20} className="text-blue-600" />}
        </button>

        <h2 className="text-3xl font-bold text-blue-700 mb-2">Crear Cuenta</h2>
        <p className={`text-sm mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Regístrate para acceder al sistema</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold ml-1">Nombre</label>
              <input type="text" name="nombre" placeholder="Juan" value={formData.nombre} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 focus:border-blue-500" : "bg-gray-50 border-gray-300 focus:border-blue-600"} px-4 py-2 border rounded-lg outline-none`} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold ml-1">Apellido</label>
              <input type="text" name="apellido" placeholder="Pérez" value={formData.apellido} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 focus:border-blue-500" : "bg-gray-50 border-gray-300 focus:border-blue-600"} px-4 py-2 border rounded-lg outline-none`} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold ml-1">Correo</label>
              <input type="email" name="correo" placeholder="correo@ejemplo.com" value={formData.correo} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 focus:border-blue-500" : "bg-gray-50 border-gray-300 focus:border-blue-600"} px-4 py-2 border rounded-lg outline-none`} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold ml-1">Contraseña</label>
              <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 focus:border-blue-500" : "bg-gray-50 border-gray-300 focus:border-blue-600"} px-4 py-2 border rounded-lg outline-none`} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold ml-1">Ficha</label>
              <input type="text" name="ficha" placeholder="12345" value={formData.ficha} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 focus:border-blue-500" : "bg-gray-50 border-gray-300 focus:border-blue-600"} px-4 py-2 border rounded-lg outline-none`} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold ml-1">Teléfono</label>
              <input type="text" name="telefono" placeholder="0412..." value={formData.telefono} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 focus:border-blue-500" : "bg-gray-50 border-gray-300 focus:border-blue-600"} px-4 py-2 border rounded-lg outline-none`} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold ml-1">Cédula</label>
              <input type="text" name="C_I" placeholder="12345678" value={formData.C_I} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 focus:border-blue-500" : "bg-gray-50 border-gray-300 focus:border-blue-600"} px-4 py-2 border rounded-lg outline-none`} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold ml-1">Rol</label>
              <select name="rol" value={formData.rol} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 focus:border-blue-500" : "bg-gray-50 border-gray-300 focus:border-blue-600"} px-4 py-2.5 border rounded-lg outline-none`}>
                <option value="">Seleccione rol</option>
                <option value="tecnico">Técnico</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold ml-1">Especialización</label>
              <select name="especializacion" value={formData.especializacion} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 focus:border-blue-500" : "bg-gray-50 border-gray-300 focus:border-blue-600"} px-4 py-2.5 border rounded-lg outline-none`}>
                <option value="">Seleccione especialización</option>
                <option value="redes">Redes</option>
                <option value="soporte">Soporte</option>
                <option value="sistemas">Sistemas</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold ml-1">Nro. Máquina</label>
              <input type="number" name="numero_maquina" placeholder="123 (opcional)" value={formData.numero_maquina} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 focus:border-blue-500" : "bg-gray-50 border-gray-300 focus:border-blue-600"} px-4 py-2 border rounded-lg outline-none`} />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-xs font-semibold ml-1">Extensión</label>
              <input type="text" name="extension" placeholder="000" value={formData.extension} onChange={(e) => handleInputChange(e, setFormData)} className={`${darkMode ? "bg-gray-700 border-gray-600 focus:border-blue-500" : "bg-gray-50 border-gray-300 focus:border-blue-600"} px-4 py-2 border rounded-lg outline-none`} />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Registrando...' : 'Finalizar Registro'}
            </button>
          </div>
        </form>

        <LoadingModal 
          isOpen={modalState.isOpen} 
          status={modalState.status} 
          message={modalState.message} 
          onClose={handleModalClose} 
        />

        <p className="mt-6 text-center text-sm">
          ¿Ya tienes cuenta? <Link to="/login" className="text-blue-700 font-bold hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
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
      // Validaciones básicas y mapeo de campos al backend
      const required = ["nombre","apellido","correo","ficha","telefono","C_I","rol","especializacion","extension","password"];
      for (const k of required) {
        if (!formData[k] && formData[k] !== 0) {
          setError('Complete todos los campos obligatorios');
          return;
        }
      }

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

      if (isNaN(payload.ci) || isNaN(payload.telefono) || isNaN(payload.ficha) || isNaN(payload.extension)) {
        setError('Los campos C_I, teléfono, ficha y extensión deben ser números válidos');
        return;
      }

      // 1) Crear la especialización usando el endpoint correspondiente
      try {
        await axios.post("http://localhost:8080/api/specializations", { nombre: String(formData.especializacion) });
      } catch (err) {
        console.error('Error al crear especialización:', err?.response?.data || err.message);
        setError(err?.response?.data?.message || 'Error al crear la especialización');
        return;
      }

      // 2) Enviar al endpoint de usuarios
      setIsLoading(true);
      await axios.post("http://localhost:8080/api/users", payload);

      // 3) Obtener id del usuario creado (no hacemos auto-login)
      let userId = null;
      try {
        const usersRes = await axios.get('http://localhost:8080/api/users');
        const found = usersRes.data.find(u => u.correo === payload.email || u.email === payload.email);
        userId = found?.id || null;
      } catch (err) {
        console.error('Error al buscar usuario:', err?.response?.data || err.message);
      }

      if (!userId) {
        setModalState({ isOpen: true, status: 'error', message: 'Registro completado, pero no se pudo obtener el id del usuario. Inicia sesión manualmente.' });
        setIsLoading(false);
        navigate('/login');
        return;
      }

      // 4) Crear la máquina si se pasó número
      if (formData.numero_maquina) {
        try {
          await axios.post('http://localhost:8080/api/machines', { id_user: Number(userId), nro_maquina: Number(formData.numero_maquina) });
        } catch (err) {
          console.error('Error al crear maquina:', err?.response?.data || err.message);
          // no abortamos, mostramos el error pero seguimos con la relación de especialización
        }
      }

      // 5) Obtener id de la especialización creada para relacionarla
      let specId = null;
      try {
        const specsRes = await axios.get('http://localhost:8080/api/specializations');
        const foundSpec = specsRes.data.find(s => s.nombre === String(formData.especializacion));
        specId = foundSpec?.id;
      } catch (err) {
        console.error('Error al obtener especializaciones:', err?.response?.data || err.message);
      }

      if (specId) {
        try {
          await axios.post('http://localhost:8080/api/specialization_users', { id_user: Number(userId), id_specia: Number(specId) });
        } catch (err) {
          console.error('Error al relacionar user-spec:', err?.response?.data || err.message);
        }
      }

      // Finalizar: informar éxito y redirigir al login al cerrar el modal
      setModalState({ isOpen: true, status: 'success', message: 'Registro exitoso. Ahora inicia sesión.' });
      setIsLoading(false);
      return;
    } catch (err) {
      console.error("Error en registro:", err);
      const msg = err?.response?.data?.message || 'Error al registrarse';
      setError(msg);
      setModalState({ isOpen: true, status: 'error', message: msg });
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalState((s) => ({ ...s, isOpen: false }));
    if (modalState.status === 'success') navigate('/login');
  };

  return (
    <div className={`${darkMode ? "fixed inset-0 bg-gray-900" : "fixed inset-0 bg-blue-600"} flex items-center justify-center`}>
      <div className={`${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-black"} p-8 rounded-xl shadow-lg w-full max-w-md mx-auto text-center relative`}>
        <button onClick={toggleTheme} className="absolute top-3 right-3 p-1 rounded opacity-90">
          {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
        <h2 className="text-2xl font-bold text-blue-700 mb-6">Registro</h2>
        {error && <div className="mb-4 text-sm text-red-400">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 mx-auto" style={{ maxWidth: "640px" }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={(e) => handleInputChange(e, setFormData)}
              className={`${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white text-black border-gray-300"} w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600`}
            />

            <input
              type="text"
              name="apellido"
              placeholder="Apellido"
              value={formData.apellido}
              onChange={(e) => handleInputChange(e, setFormData)}
              className={`${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white text-black border-gray-300"} w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600`}
            />

            <input
              type="email"
              name="correo"
              placeholder="Correo"
              value={formData.correo}
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

            <input
              type="text"
              name="ficha"
              placeholder="Ficha"
              value={formData.ficha}
              onChange={(e) => handleInputChange(e, setFormData)}
              className={`${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white text-black border-gray-300"} w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600`}
            />

            <input
              type="text"
              name="telefono"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={(e) => handleInputChange(e, setFormData)}
              className={`${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white text-black border-gray-300"} w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600`}
            />

            <input
              type="text"
              name="C_I"
              placeholder="Cédula de Identidad"
              value={formData.C_I}
              onChange={(e) => handleInputChange(e, setFormData)}
              className={`${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white text-black border-gray-300"} w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600`}
            />

            <select
              name="rol"
              value={formData.rol}
              onChange={(e) => handleInputChange(e, setFormData)}
              className={`${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white text-black border-gray-300"} w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600`}
            >
              <option value="">Seleccione rol</option>
              <option value="tecnico">Técnico</option>
              <option value="administrador">Administrador</option>
            </select>

            <select
              name="especializacion"
              value={formData.especializacion}
              onChange={(e) => handleInputChange(e, setFormData)}
              className={`${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white text-black border-gray-300"} w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600`}
            >
              <option value="">Seleccione especialización</option>
              <option value="redes">Redes</option>
              <option value="soporte">Soporte</option>
              <option value="sistemas">Sistemas</option>
            </select>

            <input
              type="number"
              name="numero_maquina"
              placeholder="Número de máquina (opcional)"
              value={formData.numero_maquina}
              onChange={(e) => handleInputChange(e, setFormData)}
              className={`${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white text-black border-gray-300"} w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600`}
            />

            <input
              type="text"
              name="extension"
              placeholder="Extensión"
              value={formData.extension}
              onChange={(e) => handleInputChange(e, setFormData)}
              className={`${darkMode ? "bg-gray-700 text-gray-100 border-gray-600" : "bg-white text-black border-gray-300"} w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600`}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-700 text-black py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60"
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
        </form>
        <LoadingModal isOpen={modalState.isOpen} status={modalState.status} message={modalState.message} onClose={handleModalClose} />
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta? <Link to="/login" className="text-blue-700 font-semibold hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
import React, { useState, useEffect } from "react";
import LoadingModal from "@/hooks/Modals/LoadingModal";
import { FaUser, FaEnvelope, FaPhone, FaCamera, FaSave, FaPen } from "react-icons/fa";

const UserProfile = ({ darkMode }) => {
  // Estado para alternar entre "Ver" y "Editar"
  const [isEditing, setIsEditing] = useState(false);

  // Datos del usuario (usamos nombres compatibles con el backend)
  const [user, setUser] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    extension: "",
    ficha: "",
    ci: "",
    role: "",
    avatar: "https://via.placeholder.com/150"
  });

  // Función para manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // Decodificar token para obtener CI en caso de que se necesite
  const decodeToken = (token) => {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(json);
    } catch (e) { return null; }
  };

  // Cargar usuario actual al montar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const idFromToken = decodeToken(token)?.id;
        const userId = localStorage.getItem('userId') || idFromToken;
        if (!userId) return;
        const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const res = await fetch(`${base}/api/users/${userId}`);
        if (!res.ok) return;
        const data = await res.json();
        setUser({
          nombre: data.nombre || data.name || "",
          apellido: data.apellido || "",
          email: data.correo || data.email || "",
          telefono: data.telefono ? String(data.telefono) : "",
          extension: data.extension ? String(data.extension) : "",
          ficha: data.ficha ? String(data.ficha) : "",
          ci: data.C_I ? String(data.C_I) : "",
          role: data.rol || "",
          avatar: data.avatar || "https://via.placeholder.com/150"
        });
      } catch (err) {
        console.error('Error fetching profile', err);
      }
    };
    loadUser();
  }, []);

  // --- Estilos Dinámicos (Modo Oscuro vs Claro) ---
  const theme = {
    card: darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
    textPrimary: darkMode ? "text-gray-100" : "text-gray-800",
    textSecondary: darkMode ? "text-gray-400" : "text-gray-500",
    input: darkMode 
      ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500" 
      : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500",
    divider: darkMode ? "border-gray-700" : "border-gray-100"
  };

  const [isSaving, setIsSaving] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, status: 'loading', message: '' });

  const handleModalClose = () => {
    setModalState((s) => ({ ...s, isOpen: false }));
  };

  const handleSave = async () => {
    try {
      // Validaciones mínimas
      if (!user.nombre || !user.apellido || !user.email) {
        setModalState({ isOpen: true, status: 'error', message: 'Nombre, Apellido y Email son obligatorios.' });
        return;
      }

      const payload = {};
      payload.nombre = user.nombre;
      payload.apellido = user.apellido;
      payload.email = user.email;
      if (user.telefono !== "") payload.telefono = Number(user.telefono);
      if (user.extension !== "") payload.extension = Number(user.extension);
      // Incluir ficha oculto si existe
      if (user.ficha !== undefined && user.ficha !== "") payload.ficha = Number(user.ficha);

      const token = localStorage.getItem('token');
      const decoded = decodeToken(token);
      const ci = decoded?.ci;
      if (!ci) {
        setModalState({ isOpen: true, status: 'error', message: 'No se pudo obtener CI del token.' });
        return;
      }

      const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${base}/api/users/${ci}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = (body && body.message) ? body.message : res.statusText || 'Error al actualizar';
        setModalState({ isOpen: true, status: 'error', message: msg });
        return;
      }

      // éxito
      setModalState({ isOpen: true, status: 'success', message: body?.message || 'Perfil actualizado correctamente' });
      setIsEditing(false);

      // actualizar estado local con lo que haya en body.user (si viene)
      if (body?.user) {
        setUser((prev) => ({ ...prev,
          nombre: body.user.nombre || prev.nombre,
          apellido: body.user.apellido || prev.apellido,
          email: body.user.correo || body.user.email || prev.email,
          telefono: body.user.telefono ? String(body.user.telefono) : prev.telefono,
          extension: body.user.extension ? String(body.user.extension) : prev.extension
        }));
      }

    } catch (err) {
      console.error('Error saving profile', err);
      setModalState({ isOpen: true, status: 'error', message: err?.message || 'Error al guardar' });
    }
  }

  return (
    <div className={`w-full max-w-5xl mx-auto rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 ${theme.card}`}>
      
      {/* 1. PORTADA (BANNER) */}
      <div className="relative h-48 bg-gradient-to-r from-gray-400 to-gray-600">
        {/* Botón Editar/Guardar Flotante */}
        <button 
          onClick={async () => {
            if (isEditing) {
              // Guardar cambios
              setIsSaving(true);
              await handleSave();
              setIsSaving(false);
              return;
            }
            setIsEditing(true);
          }}
          className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 backdrop-blur text-white px-5 py-2 rounded-full flex items-center gap-2 transition-all font-medium shadow-lg"
        >
          {isEditing ? <><FaSave /> {isSaving ? 'Guardando...' : 'Guardar'}</> : <><FaPen size={14} /> Editar</>}
        </button>
      </div>

      <div className="px-8 pb-10">
        {/* 2. ENCABEZADO: FOTO Y NOMBRE */}
        <div className="relative flex flex-col sm:flex-row items-center sm:items-end -mt-20 mb-8">
          
          {/* Avatar */}
          <div className="relative group">
            <img 
              src={user.avatar} 
              alt="Avatar" 
              className={`w-40 h-40 rounded-full border-4 object-cover shadow-md transition-colors ${darkMode ? "border-gray-800" : "border-white"}`} 
            />
            {isEditing && (
              <button className="absolute bottom-2 right-2 bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 shadow-lg transition-transform transform hover:scale-110">
                <FaCamera size={16} />
              </button>
            )}
          </div>

          {/* Textos: Nombre y Rol */}
          <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left flex-1 pb-2">
            <h2 className={`text-3xl font-bold min-h-[40px] ${theme.textPrimary}`}>
              { (user.nombre || user.apellido) ? `${user.nombre || ''} ${user.apellido || ''}`.trim() : "Nombre del Usuario" }
            </h2>
            <p className={`text-lg font-medium min-h-[28px] ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
              {user.role || "Rol / Cargo"}
            </p>
          </div>
        </div>

        {/* 3. GRID DE INFORMACIÓN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* COLUMNA IZQUIERDA: DATOS DE CONTACTO */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h3 className={`text-xl font-semibold border-b pb-3 mb-4 ${theme.textPrimary} ${theme.divider}`}>
                Información Personal
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileField 
                  label="Nombre" 
                  icon={FaUser} 
                  name="nombre" 
                  value={user.nombre} 
                  placeholder="Ingrese nombre..."
                  isEditing={isEditing} 
                  handleChange={handleChange} 
                  theme={theme}
                />

                <ProfileField 
                  label="Apellido" 
                  icon={FaUser} 
                  name="apellido" 
                  value={user.apellido} 
                  placeholder="Ingrese apellido..."
                  isEditing={isEditing} 
                  handleChange={handleChange} 
                  theme={theme}
                />

                <ProfileField 
                  label="Correo Electrónico" 
                  icon={FaEnvelope} 
                  name="email" 
                  value={user.email} 
                  placeholder="ejemplo@correo.com"
                  isEditing={isEditing} 
                  handleChange={handleChange} 
                  theme={theme}
                />

                <ProfileField 
                  label="Teléfono" 
                  icon={FaPhone} 
                  name="telefono" 
                  value={user.telefono} 
                  placeholder="000000000"
                  isEditing={isEditing} 
                  handleChange={handleChange} 
                  theme={theme}
                />

                <ProfileField 
                  label="Extensión" 
                  icon={FaPhone} 
                  name="extension" 
                  value={user.extension} 
                  placeholder="123"
                  isEditing={isEditing} 
                  handleChange={handleChange} 
                  theme={theme}
                />

                {/* Mostrar Cédula y Ficha (no editables) */}
                <ProfileField 
                  label="Cédula" 
                  icon={FaUser} 
                  name="ci" 
                  value={user.ci} 
                  placeholder="Cédula"
                  isEditing={false} 
                  handleChange={() => {}} 
                  theme={theme}
                />

                <ProfileField 
                  label="Ficha" 
                  icon={FaUser} 
                  name="ficha" 
                  value={user.ficha} 
                  placeholder="Ficha"
                  isEditing={false} 
                  handleChange={() => {}} 
                  theme={theme}
                />
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: BIO / SOBRE MÍ */}
          {/* Eliminado: Sección 'Sobre Mí' ya no se muestra según requerimiento */}

        </div>
      </div>

      {/* Modal feedback */}
      <LoadingModal isOpen={modalState.isOpen} status={modalState.status} message={modalState.message} onClose={handleModalClose} />
    </div>
  );
};

// --- Subcomponente para los campos (Inputs) ---
const ProfileField = ({ label, icon: Icon, name, value, placeholder, isEditing, handleChange, theme }) => (
  <div>
    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${theme.textSecondary}`}>
      {label}
    </label>
    <div className={`flex items-center rounded-lg transition-all duration-200 ${isEditing ? theme.input + " border px-3" : "px-0 border-transparent"}`}>
      <span className={`py-3 pr-3 ${isEditing ? "opacity-50" : "opacity-100"}`}>
        <Icon className={theme.textSecondary} />
      </span>
      <input
        type="text"
        name={name}
        disabled={!isEditing}
        value={value}
        onChange={handleChange}
        placeholder={isEditing ? placeholder : ""}
        className={`w-full py-2.5 bg-transparent outline-none transition-colors ${
          !isEditing 
            ? `font-medium text-lg cursor-default ${theme.textPrimary}` 
            : `text-sm ${theme.textPrimary}`
        }`}
      />
    </div>
    {!isEditing && <div className={`h-[1px] w-full ${theme.divider} mt-1`}></div>}
  </div>
);

export default UserProfile;
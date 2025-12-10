import React, { useState } from "react";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCamera, FaSave, FaPen } from "react-icons/fa";

const UserProfile = ({ darkMode }) => {
  // Estado para alternar entre "Ver" y "Editar"
  const [isEditing, setIsEditing] = useState(false);

  // Datos iniciales vacíos (Estructura sin datos)
  const [user, setUser] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    address: "",
    about: "",
    avatar: "https://via.placeholder.com/150" // Placeholder genérico para que no se rompa la imagen
  });

  // Función para manejar cambios en los inputs
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

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

  return (
    <div className={`w-full max-w-5xl mx-auto rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 ${theme.card}`}>
      
      {/* 1. PORTADA (BANNER) */}
      <div className="relative h-48 bg-gradient-to-r from-gray-400 to-gray-600">
        {/* Botón Editar/Guardar Flotante */}
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 backdrop-blur text-white px-5 py-2 rounded-full flex items-center gap-2 transition-all font-medium shadow-lg"
        >
          {isEditing ? <><FaSave /> Guardar</> : <><FaPen size={14} /> Editar</>}
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
              {user.name || "Nombre del Usuario"}
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
                  label="Nombre Completo" 
                  icon={FaUser} 
                  name="name" 
                  value={user.name} 
                  placeholder="Ingrese nombre..."
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
                  name="phone" 
                  value={user.phone} 
                  placeholder="+00 000 000 0000"
                  isEditing={isEditing} 
                  handleChange={handleChange} 
                  theme={theme}
                />

                <ProfileField 
                  label="Ubicación" 
                  icon={FaMapMarkerAlt} 
                  name="address" 
                  value={user.address} 
                  placeholder="Ciudad, País"
                  isEditing={isEditing} 
                  handleChange={handleChange} 
                  theme={theme}
                />
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: BIO / SOBRE MÍ */}
          <div className="lg:col-span-1">
            <h3 className={`text-xl font-semibold border-b pb-3 mb-4 ${theme.textPrimary} ${theme.divider}`}>
              Sobre Mí
            </h3>
            
            <div className={`p-5 rounded-xl h-64 ${darkMode ? "bg-gray-700/30" : "bg-gray-50 border border-gray-100"}`}>
              {isEditing ? (
                <textarea
                  name="about"
                  value={user.about}
                  onChange={handleChange}
                  className={`w-full h-full bg-transparent resize-none outline-none text-sm leading-relaxed ${theme.textPrimary}`}
                  placeholder="Escribe una breve descripción..."
                />
              ) : (
                <p className={`text-sm leading-relaxed italic ${theme.textSecondary}`}>
                  {user.about || "Sin descripción disponible."}
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
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
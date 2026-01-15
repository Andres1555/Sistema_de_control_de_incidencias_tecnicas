import React, { useState, useEffect } from "react";
import LoadingModal from "@/hooks/Modals/LoadingModal";
import { FaUser, FaEnvelope, FaPhone, FaSave, FaPen } from "react-icons/fa";

const UserProfile = ({ darkMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, status: 'loading', message: '' });

  const [user, setUser] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    extension: "",
    ficha: "",
    ci: "",
    role: "",
    avatar: "" 
  });

  const getInitial = () => {
    if (user.nombre) return user.nombre.charAt(0).toUpperCase();
    return "?";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const decodeToken = (token) => {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(json);
    } catch (e) { return null; }
  };

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
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          email: data.correo || data.email || "",
          telefono: data.telefono ? String(data.telefono) : "",
          extension: data.extension ? String(data.extension) : "",
          ficha: data.ficha ? String(data.ficha) : "",
          ci: data.C_I ? String(data.C_I) : "",
          role: data.rol || "",
          avatar: data.avatar || "" 
        });
      } catch (err) {
        console.error('Error fetching profile', err);
      }
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    try {
      if (!user.nombre || !user.apellido || !user.email) {
        setModalState({ isOpen: true, status: 'error', message: 'Datos obligatorios faltantes.' });
        return;
      }
      setIsSaving(true);
      const token = localStorage.getItem('token');
      const ci = decodeToken(token)?.ci;
      const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      
      const res = await fetch(`${base}/api/users/${ci}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            telefono: Number(user.telefono),
            extension: Number(user.extension)
        }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Error al actualizar');

      setModalState({ isOpen: true, status: 'success', message: 'Perfil actualizado correctamente' });
      setIsEditing(false);
    } catch (err) {
      setModalState({ isOpen: true, status: 'error', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const theme = {
    card: darkMode ? "bg-[#1e293b] border-slate-700" : "bg-white border-slate-200",
    textPrimary: darkMode ? "text-white" : "text-slate-900",
    textSecondary: darkMode ? "text-slate-400" : "text-slate-500",
    fieldBg: darkMode ? "bg-slate-800/50" : "bg-slate-50",
    fieldBorder: darkMode ? "border-slate-700" : "border-slate-200",
  };

  return (
    <div className={`w-full max-w-5xl mx-auto rounded-3xl shadow-2xl border overflow-hidden transition-all duration-500 ${theme.card}`}>
      
      {/* 1. PORTADA */}
      <div className="relative h-60 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900">
        <div className="absolute inset-0 bg-black/10"></div>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="absolute top-8 right-8 bg-white text-slate-900 px-6 py-2.5 rounded-2xl flex items-center gap-2 transition-all hover:scale-105 font-bold shadow-2xl z-20"
        >
          {isEditing ? <><FaSave /> {isSaving ? 'Guardando...' : 'Guardar'}</> : <><FaPen size={12} /> Editar Perfil</>}
        </button>
      </div>

      <div className="px-12 pb-14">
        {/* 2. CABECERA */}
        <div className="relative flex flex-col sm:flex-row items-center sm:items-end -mt-28 mb-12">
          <div className="relative z-10">
            <div className={`w-48 h-48 rounded-[2.5rem] border-[8px] shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-300 ${darkMode ? "border-[#1e293b] bg-slate-800" : "border-white bg-slate-100"}`}>
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                  <span className="text-7xl font-black text-white drop-shadow-lg">{getInitial()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 sm:mt-0 sm:ml-10 text-center sm:text-left flex-1">
            <h2 className={`text-5xl font-black tracking-tighter mb-2 ${theme.textPrimary}`}>
              {user.nombre ? `${user.nombre} ${user.apellido}` : "Usuario"}
            </h2>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
               <span className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-500/30">
                  CÉDULA: {user.ci || "---"}
               </span>
               <span className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-slate-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg">
                  FICHA: {user.ficha || "---"}
               </span>
               <span className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest border ${theme.fieldBorder} ${theme.textSecondary} bg-white/50 backdrop-blur-sm`}>
                  {user.role || "MIEMBRO"}
               </span>
            </div>
          </div>
        </div>

        {/* 3. GRID DE CAJAS DETALLADAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DetailBox label="Nombres" icon={FaUser} name="nombre" value={user.nombre} isEditing={isEditing} onChange={handleChange} theme={theme} />
            <DetailBox label="Apellidos" icon={FaUser} name="apellido" value={user.apellido} isEditing={isEditing} onChange={handleChange} theme={theme} />
            <DetailBox label="Correo Electrónico" icon={FaEnvelope} name="email" value={user.email} isEditing={isEditing} onChange={handleChange} theme={theme} />
            <DetailBox label="Teléfono de Contacto" icon={FaPhone} name="telefono" value={user.telefono} isEditing={isEditing} onChange={handleChange} theme={theme} />
            <DetailBox label="Extensión" icon={FaPhone} name="extension" value={user.extension} isEditing={isEditing} onChange={handleChange} theme={theme} />
        </div>
      </div>

      <LoadingModal 
        isOpen={modalState.isOpen} 
        status={modalState.status} 
        message={modalState.message} 
        onClose={() => setModalState(s => ({...s, isOpen: false}))} 
      />
    </div>
  );
};

const DetailBox = ({ label, icon: Icon, name, value, isEditing, onChange, theme }) => (
  <div className={`p-5 rounded-3xl border transition-all duration-300 ${theme.fieldBg} ${isEditing ? 'border-blue-500 shadow-lg shadow-blue-500/10' : theme.fieldBorder}`}>
    <div className="flex items-center gap-4 mb-3">
      <div className={`p-3 rounded-2xl ${isEditing ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
        <Icon size={18} />
      </div>
      <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.textSecondary}`}>
        {label}
      </label>
    </div>
    <input
      type="text"
      name={name}
      disabled={!isEditing}
      value={value}
      onChange={onChange}
      className={`w-full bg-transparent outline-none font-bold transition-all ${isEditing ? 'text-blue-600 text-base' : `text-lg ${theme.textPrimary}`}`}
      placeholder="---"
    />
  </div>
);

export default UserProfile;
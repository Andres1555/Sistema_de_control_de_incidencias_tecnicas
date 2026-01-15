import React, { useState, useEffect } from "react";
import LoadingModal from "@/hooks/Modals/LoadingModal";
import { FaUser, FaBuilding, FaCalendarAlt, FaSave, FaPen } from "react-icons/fa";

const WorkerProfile = ({ darkMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, status: 'loading', message: '' });

  const [worker, setWorker] = useState({
    id: "",
    ficha: "",
    nombres: "",
    apellidos: "",
    nac_dia: "",
    nac_mes: "",
    nac_ano: "",
    departamento: "",
    gerencia: "",
    avatar: "" 
  });

  const getInitial = () => {
    if (worker.nombres) return worker.nombres.charAt(0).toUpperCase();
    return "?";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWorker((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const loadWorker = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!userId || userId === "undefined") return;

        const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const res = await fetch(`${base}/api/workers/${userId}`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) return;
        const data = await res.json();

        setWorker({
          id: data.id || userId,
          ficha: data.ficha || "",
          nombres: data.nombres || "",
          apellidos: data.apellidos || "",
          nac_dia: data.dia_nac || "",
          nac_mes: data.mes_nac || "",
          nac_ano: data.anio_nac || "",
          departamento: data.dpto || "",
          gerencia: data.gcia || "",
          avatar: data.avatar || ""
        });
      } catch (err) {
        console.error('Error loading worker profile:', err);
      }
    };
    loadWorker();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';

      const payload = {
        ficha: Number(worker.ficha),
        nombres: worker.nombres,
        apellidos: worker.apellidos,
        anio_nac: Number(worker.nac_ano),
        mes_nac: Number(worker.nac_mes),
        dia_nac: Number(worker.nac_dia),
        dpto: worker.departamento,
        gcia: worker.gerencia
      };

      const res = await fetch(`${base}/api/workers/${worker.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Error al actualizar');

      setModalState({ isOpen: true, status: 'success', message: 'Datos actualizados correctamente' });
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
      <div className="relative h-60 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700">
        <div className="absolute inset-0 bg-black/10"></div>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="absolute top-8 right-8 bg-white text-slate-900 px-6 py-2.5 rounded-2xl flex items-center gap-2 transition-all hover:scale-105 font-bold shadow-2xl z-20"
        >
          {isEditing ? <><FaSave /> {isSaving ? 'Guardando...' : 'Guardar'}</> : <><FaPen size={12} /> Editar Perfil</>}
        </button>
      </div>

      <div className="px-12 pb-14">
        {/* 2. CABECERA: AVATAR Y TÍTULOS */}
        <div className="relative flex flex-col sm:flex-row items-center sm:items-end -mt-28 mb-12">
          <div className="relative z-10">
            <div className={`w-48 h-48 rounded-[2.5rem] border-[8px] shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-300 ${darkMode ? "border-[#1e293b] bg-slate-800" : "border-white bg-slate-100"}`}>
              {worker.avatar ? (
                <img src={worker.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                  <span className="text-7xl font-black text-white drop-shadow-lg">{getInitial()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 sm:mt-0 sm:ml-10 text-center sm:text-left flex-1">
            <h2 className={`text-5xl font-black tracking-tighter mb-2 ${theme.textPrimary}`}>
              {worker.nombres ? `${worker.nombres} ${worker.apellidos}` : "Trabajador"}
            </h2>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3">
               <span className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/30">
                  FICHA NO. {worker.ficha || "---"}
               </span>
               <span className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest border ${theme.fieldBorder} ${theme.textSecondary} bg-white/50 backdrop-blur-sm`}>
                  {worker.gerencia || "SIN GERENCIA"}
               </span>
            </div>
          </div>
        </div>

        {/* 3. GRID DE CAJAS DETALLADAS (FICHA ELIMINADA DE AQUÍ) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DetailBox label="Nombres" icon={FaUser} name="nombres" value={worker.nombres} isEditing={isEditing} onChange={handleChange} theme={theme} />
            <DetailBox label="Apellidos" icon={FaUser} name="apellidos" value={worker.apellidos} isEditing={isEditing} onChange={handleChange} theme={theme} />
            <DetailBox label="Gerencia" icon={FaBuilding} name="gerencia" value={worker.gerencia} isEditing={isEditing} onChange={handleChange} theme={theme} />
            <DetailBox label="Departamento" icon={FaBuilding} name="departamento" value={worker.departamento} isEditing={isEditing} onChange={handleChange} theme={theme} />
            
            {/* Caja de Fecha de Nacimiento */}
            <div className={`p-5 rounded-3xl border transition-all duration-300 ${theme.fieldBg} ${isEditing ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : theme.fieldBorder} md:col-span-2`}>
              <div className="flex items-center gap-4 mb-3">
                <div className={`p-3 rounded-2xl ${isEditing ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                  <FaCalendarAlt size={18} />
                </div>
                <label className={`text-[11px] font-black uppercase tracking-[0.2em] ${theme.textSecondary}`}>Fecha de Nacimiento</label>
              </div>
              <div className="flex items-center gap-6 max-w-md">
                <div className="flex-1">
                   <p className={`text-[10px] uppercase font-bold mb-1 ${theme.textSecondary} text-center`}>Día</p>
                   <input type="number" name="nac_dia" placeholder="DD" value={worker.nac_dia} onChange={handleChange} disabled={!isEditing} className={`w-full bg-transparent outline-none font-bold text-center ${isEditing ? 'text-emerald-500 border-b-2 border-emerald-500/20' : theme.textPrimary} text-xl`} />
                </div>
                <span className={`text-2xl mt-4 ${theme.textSecondary}`}>/</span>
                <div className="flex-1">
                   <p className={`text-[10px] uppercase font-bold mb-1 ${theme.textSecondary} text-center`}>Mes</p>
                   <input type="number" name="nac_mes" placeholder="MM" value={worker.nac_mes} onChange={handleChange} disabled={!isEditing} className={`w-full bg-transparent outline-none font-bold text-center ${isEditing ? 'text-emerald-500 border-b-2 border-emerald-500/20' : theme.textPrimary} text-xl`} />
                </div>
                <span className={`text-2xl mt-4 ${theme.textSecondary}`}>/</span>
                <div className="flex-1">
                   <p className={`text-[10px] uppercase font-bold mb-1 ${theme.textSecondary} text-center`}>Año</p>
                   <input type="number" name="nac_ano" placeholder="AAAA" value={worker.nac_ano} onChange={handleChange} disabled={!isEditing} className={`w-full bg-transparent outline-none font-bold text-center ${isEditing ? 'text-emerald-500 border-b-2 border-emerald-500/20' : theme.textPrimary} text-xl`} />
                </div>
              </div>
            </div>
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
  <div className={`p-5 rounded-3xl border transition-all duration-300 ${theme.fieldBg} ${isEditing ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : theme.fieldBorder}`}>
    <div className="flex items-center gap-4 mb-3">
      <div className={`p-3 rounded-2xl ${isEditing ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
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
      className={`w-full bg-transparent outline-none font-bold transition-all ${isEditing ? 'text-emerald-500 text-base' : `text-lg ${theme.textPrimary}`}`}
      placeholder="---"
    />
  </div>
);

export default WorkerProfile;
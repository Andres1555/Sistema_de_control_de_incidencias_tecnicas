import React, { useState, useEffect } from "react";
import LoadingModal from "@/hooks/Modals/LoadingModal";
import { FaUser, FaIdCard, FaBuilding, FaCamera, FaSave, FaPen } from "react-icons/fa";

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
    avatar: "https://via.placeholder.com/150"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWorker((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const loadWorker = async () => {
      console.log("%c--- INICIANDO CARGA DE PERFIL ---", "color: blue; font-weight: bold;");
      
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        console.log("Token encontrado:", token ? "SÍ" : "NO");
        console.log("ID de usuario en localStorage:", userId);

        if (!userId || userId === "undefined") {
          console.error("ERROR: No hay un ID válido en el localStorage.");
          return;
        }

        // Si tu backend corre en un puerto distinto al 8080, cámbialo aquí manualmente para probar
        const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const url = `${base}/api/workers/${userId}`;
        
        console.log("Llamando a la URL:", url);

        const res = await fetch(url, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log("Respuesta del servidor (Status):", res.status);

        if (!res.ok) {
          const errorMsg = await res.text();
          console.error("Error del servidor:", errorMsg);
          return;
        }

        const data = await res.json();
        console.log("DATOS RECIBIDOS:", data);

        // Ajustamos los nombres según tu Schema de Sequelize
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
          avatar: data.avatar || "https://via.placeholder.com/150"
        });

        console.log("%cDATOS APLICADOS AL ESTADO CORRECTAMENTE", "color: green; font-weight: bold;");

      } catch (err) {
        console.error('ERROR CRÍTICO EN EL FETCH:', err);
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

      setModalState({ isOpen: true, status: 'success', message: 'Actualizado correctamente' });
      setIsEditing(false);
    } catch (err) {
      setModalState({ isOpen: true, status: 'error', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

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
      <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-800">
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 backdrop-blur text-white px-5 py-2 rounded-full flex items-center gap-2 transition-all font-medium shadow-lg z-10"
        >
          {isEditing ? <><FaSave /> {isSaving ? 'Guardando...' : 'Guardar'}</> : <><FaPen size={14} /> Editar Perfil</>}
        </button>
      </div>

      <div className="px-8 pb-10">
        <div className="relative flex flex-col sm:flex-row items-center sm:items-end -mt-20 mb-8">
          <div className="relative">
            <img src={worker.avatar} className={`w-40 h-40 rounded-full border-4 object-cover shadow-md ${darkMode ? "border-gray-800" : "border-white"}`} alt="Avatar" />
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left flex-1">
            <h2 className={`text-3xl font-bold ${theme.textPrimary}`}>
              {worker.nombres ? `${worker.nombres} ${worker.apellidos}` : "Cargando..."}
            </h2>
            <p className={`text-lg font-medium ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
              ID: {worker.id || "..."} | Ficha: {worker.ficha || "..."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            <ProfileField label="Ficha" icon={FaIdCard} name="ficha" value={worker.ficha} isEditing={isEditing} handleChange={handleChange} theme={theme} />
            <ProfileField label="Nombres" icon={FaUser} name="nombres" value={worker.nombres} isEditing={isEditing} handleChange={handleChange} theme={theme} />
            <ProfileField label="Apellidos" icon={FaUser} name="apellidos" value={worker.apellidos} isEditing={isEditing} handleChange={handleChange} theme={theme} />
            
            <div className="md:col-span-2">
                <label className={`block text-xs font-bold uppercase mb-2 ${theme.textSecondary}`}>Fecha de Nacimiento</label>
                <div className="flex gap-2">
                    <input type="number" name="nac_dia" placeholder="DD" value={worker.nac_dia} onChange={handleChange} disabled={!isEditing} className={`w-20 p-2 rounded-md border ${isEditing ? theme.input : "bg-transparent border-transparent"}`} />
                    <input type="number" name="nac_mes" placeholder="MM" value={worker.nac_mes} onChange={handleChange} disabled={!isEditing} className={`w-20 p-2 rounded-md border ${isEditing ? theme.input : "bg-transparent border-transparent"}`} />
                    <input type="number" name="nac_ano" placeholder="AAAA" value={worker.nac_ano} onChange={handleChange} disabled={!isEditing} className={`w-32 p-2 rounded-md border ${isEditing ? theme.input : "bg-transparent border-transparent"}`} />
                </div>
            </div>

            <ProfileField label="Gerencia" icon={FaBuilding} name="gerencia" value={worker.gerencia} isEditing={isEditing} handleChange={handleChange} theme={theme} />
            <ProfileField label="Departamento" icon={FaBuilding} name="departamento" value={worker.departamento} isEditing={isEditing} handleChange={handleChange} theme={theme} />
        </div>
      </div>
      <LoadingModal isOpen={modalState.isOpen} status={modalState.status} message={modalState.message} onClose={() => setModalState(p => ({...p, isOpen: false}))} />
    </div>
  );
};

const ProfileField = ({ label, icon: Icon, name, value, isEditing, handleChange, theme }) => (
  <div>
    <label className={`block text-xs font-bold uppercase mb-1 ${theme.textSecondary}`}>{label}</label>
    <div className={`flex items-center rounded-lg border ${isEditing ? theme.input : "border-transparent px-0"}`}>
      <span className="p-2"><Icon className={theme.textSecondary} /></span>
      <input type="text" name={name} value={value} onChange={handleChange} disabled={!isEditing} className={`w-full p-2 bg-transparent outline-none ${theme.textPrimary}`} />
    </div>
  </div>
);

export default WorkerProfile;
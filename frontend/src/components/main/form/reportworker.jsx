import React, { useState, forwardRef, useEffect } from "react";
import { FaTrash, FaPaperPlane, FaSave } from "react-icons/fa";
import LoadingModal from "@/hooks/Modals/LoadingModal";

const ReportWorker = forwardRef(({ onSuccess, onClose, initialData, isEdit = false, readOnlyDefault = false, darkMode = false }, ref) => {
  // --- ESTADOS ---
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // FECHA ACTUAL AUTOMÁTICA
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const initialFormData = {
    caso: "",
    id_maquina: "", // Aquí guardaremos el NRO de máquina
    area: "",
    estado: "en espera",
    descripcion: "",
    nombre_natural: "",
    nombre_windows: "", 
    clave_natural: "",
    clave_win: "",
    fecha: getTodayDate(), 
  };

  const [formData, setFormData] = useState(initialData || initialFormData);

  const [modalState, setModalState] = useState({
    isOpen: false,
    status: "loading",
    message: "",
  });

  // --- CORRECCIÓN EN EL MAPEADO DE DATOS (useEffect) ---
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        estado: initialData.estado || "en espera",
        
        // 1. PRIORIDAD AL NRO DE MÁQUINA:
        // Buscamos primero en el objeto Machine (que viene del JOIN en el back)
        // Si no, en nro_maquina, y si no, en id_maquina.
        id_maquina: initialData.Machine?.nro_maquina ?? initialData.nro_maquina ?? initialData.id_maquina ?? "",
        
        // 2. MAPEO DE NOMBRE WINDOWS:
        nombre_windows: initialData.nombre_windows ?? "", 
        
        clave_win: initialData.clave_win ?? initialData.clave_acceso_windows ?? "",
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendForm = async () => {
    const required = ["caso", "id_maquina", "area", "descripcion", "fecha"];
    for (const key of required) {
      if (!formData[key]) {
        setModalState({ isOpen: true, status: "error", message: "Complete los campos obligatorios." });
        return;
      }
    }

    setIsLoading(true);
    setModalState({ isOpen: true, status: "loading", message: "Enviando reporte..." });

    try {
      const token = localStorage.getItem("token");
      const headers = { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      };
      const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';

      const isUpdating = isEdit && initialData?.id;
      const url = isUpdating ? `${base}/api/report/${initialData.id}` : `${base}/api/report`;
      
      // Enviamos nro_maquina para que el backend inteligente lo procese
      const payload = {
        ...formData,
        nro_maquina: Number(formData.id_maquina),
        id_maquina: Number(formData.id_maquina),
        nombre_windows: String(formData.nombre_windows)
      };

      const res = await fetch(url, {
        method: isUpdating ? "PUT" : "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al procesar el reporte");

      setFormSubmitted(true);
      setModalState({ 
        isOpen: true, 
        status: "success", 
        message: isUpdating ? "Reporte actualizado con éxito" : "Reporte creado con éxito" 
      });

    } catch (err) {
      console.error(err);
      setModalState({ isOpen: true, status: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // --- ESTILOS ---
  const inputClass = `w-full p-2.5 rounded-xl border outline-none transition-all font-bold ${
    darkMode 
      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" 
      : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-600"
  } ${readOnlyDefault ? "bg-transparent border-transparent cursor-default font-black text-lg" : "border-solid shadow-sm"}`;

  const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`;

  return (
    <>
      <div className="space-y-6 animate-fade-in p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={labelClass}>Título de la Falla</label>
            <input type="text" name="caso" value={formData.caso} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} placeholder="Ej: Monitor no enciende" />
          </div>

          <div>
            <label className={labelClass}>Número de Máquina</label>
            <input type="number" name="id_maquina" value={formData.id_maquina} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} placeholder="Ej: 102" />
          </div>

          <div>
            <label className={labelClass}>Área de Trabajo</label>
            <input type="text" name="area" value={formData.area} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} placeholder="Ej: Reducción" />
          </div>

          <div>
            <label className={labelClass}>Estado</label>
            <select name="estado" value={formData.estado} disabled={true} className={`${inputClass} opacity-60 cursor-not-allowed uppercase text-xs`}>
              <option value="en espera">En espera</option>
              <option value="en revision">En revisión</option>
              <option value="resuelto">Resuelto</option>
              <option value="escalado">Escalado</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Fecha del reporte</label>
            <input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Descripción del Problema</label>
            <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} disabled={readOnlyDefault} rows="3" className={inputClass} placeholder="Describa brevemente qué sucedió..." />
          </div>

          <div>
            <label className={labelClass}>Nombre Natural</label>
            <input type="text" name="nombre_natural" value={formData.nombre_natural} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} />
          </div>

          {/* ATRIBUTO NOMBRE WINDOWS */}
          <div>
            <label className={labelClass}>Nombre Usuario Windows</label>
            <input type="text" name="nombre_windows" value={formData.nombre_windows} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Clave Natural</label>
            <input type="text" name="clave_natural" value={formData.clave_natural} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Clave Windows</label>
            <input type="text" name="clave_win" value={formData.clave_win} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} />
          </div>
        </div>

        {!readOnlyDefault && (
          <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t border-gray-700/30">
            <button type="button" onClick={onClose} className={`flex-1 md:flex-none h-11 px-8 flex items-center justify-center gap-2 rounded-xl text-[11px] font-black transition-all uppercase shadow-sm active:scale-95 border-2 ${
                darkMode ? "bg-transparent border-red-600 text-red-500 hover:bg-red-600 hover:text-white" : "bg-white border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            }`}><FaTrash size={12} /> Cancelar</button>
            <button type="button" onClick={sendForm} disabled={isLoading} className={`flex-1 md:flex-none h-11 px-10 flex items-center justify-center gap-2 rounded-xl text-[11px] font-black transition-all uppercase shadow-md active:scale-95 text-white ${
                darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-[#1a1a1a] hover:bg-blue-700"
              } disabled:opacity-50`}>
              {isEdit ? <FaSave size={14} /> : <FaPaperPlane size={14} />}
              {isLoading ? "Procesando..." : (isEdit ? "Guardar Cambios" : "Enviar Reporte")}
            </button>
          </div>
        )}
      </div>

      <LoadingModal
        isOpen={modalState.isOpen}
        status={modalState.status}
        message={modalState.message}
        onClose={() => {
          if (modalState.status === "success" && formSubmitted) {
            onSuccess?.();
            onClose?.();
          }
          setModalState(s => ({ ...s, isOpen: false }));
        }}
      />
    </>
  );
});

export default ReportWorker;
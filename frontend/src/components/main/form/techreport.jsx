import React, { useState, forwardRef, useEffect } from "react";
import LoadingModal from "@/hooks/Modals/LoadingModal";
import { FaWrench, FaCheckCircle, FaClock, FaSave, FaHashtag, FaUserTie, FaTrash, FaClipboardList, FaFileAlt } from "react-icons/fa";

const Techreport = forwardRef(({ onSuccess, onClose, initialData, isEdit = false, readOnlyDefault = false, darkMode = false }, ref) => {
  
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(Boolean(readOnlyDefault));

  // --- VARIABLE DE ENTORNO ---
  const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const loggedUserName = localStorage.getItem('userName') || "Usuario";
  const loggedUserId = localStorage.getItem('userId');

  const [formData, setFormData] = useState({
    id_user: initialData?.id_user || loggedUserId || "",
    id_report: initialData?.id_report || "",
    caso_tecnico: initialData?.caso_tecnico || "",
    resolucion: initialData?.resolucion || "",
    tiempo: initialData?.tiempo || getCurrentTime(),
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    status: "loading",
    message: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id_user: initialData.id_user || loggedUserId,
        id_report: initialData.id_report,
        caso_tecnico: initialData.caso_tecnico || "",
        resolucion: initialData.resolucion || "",
        tiempo: initialData.tiempo || getCurrentTime(), 
      });
    }
    setIsReadOnly(Boolean(readOnlyDefault));
  }, [initialData, readOnlyDefault, loggedUserId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendForm = async () => {
    if (!formData.caso_tecnico || !formData.resolucion || !formData.tiempo) {
      setModalState({ isOpen: true, status: "error", message: "Todos los campos son obligatorios." });
      return;
    }

    setIsLoading(true);
    setModalState({ isOpen: true, status: "loading", message: "Guardando informe técnico..." });

    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        id_user: Number(formData.id_user),
        id_report: Number(formData.id_report),
        caso_tecnico: String(formData.caso_tecnico),
        resolucion: String(formData.resolucion),
        tiempo: String(formData.tiempo),
      };

      const method = isEdit ? 'PUT' : 'POST';
      // URL DINÁMICA
      const url = isEdit ? `${base}/api/report_cases/${initialData.id}` : `${base}/api/report_cases`;

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error en el servidor");

      setFormSubmitted(true);
      setModalState({
        isOpen: true,
        status: "success",
        message: `Reporte resuelto exitosamente por: ${loggedUserName.toUpperCase()}`,
      });

    } catch (err) {
      setModalState({ isOpen: true, status: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    if (modalState.status === "success" && formSubmitted) {
      onSuccess?.();
      onClose?.();
    }
    setModalState((s) => ({ ...s, isOpen: false }));
  };

  const inputClass = `w-full p-2.5 rounded-xl border outline-none transition-all font-bold ${
    darkMode 
      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" 
      : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-600"
  } ${isReadOnly ? "bg-transparent border-transparent cursor-default font-black text-lg" : "border-solid shadow-sm"}`;

  const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`;

  return (
    <>
      {isReadOnly ? (
        <div className="space-y-6 animate-fade-in p-6 md:p-8">
          <div className={`p-6 rounded-2xl border transition-all ${
            darkMode ? "bg-slate-800/40 border-slate-700/50" : "bg-gray-50 border-gray-200"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <FaClipboardList className={darkMode ? "text-orange-400" : "text-orange-600"} size={16} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-orange-400" : "text-orange-600"}`}>
                Informe T&eacute;cnico
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black leading-tight">
              {formData.caso_tecnico || "Caso Técnico"}
            </h2>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className={`px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                darkMode ? 'bg-slate-700/50 text-slate-300 border border-slate-600/30' : 'bg-white text-gray-700 border border-gray-200 shadow-sm'
              }`}>
                Reporte #{formData.id_report}
              </span>
              <span className={`px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                darkMode ? 'bg-slate-700/50 text-slate-300 border border-slate-600/30' : 'bg-white text-gray-700 border border-gray-200 shadow-sm'
              }`}>
                <FaClock size={10} /> {formData.tiempo}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl border ${
              darkMode ? "bg-slate-800/20 border-slate-700/30" : "bg-white border-gray-200/60 shadow-sm"
            } space-y-4`}>
              <h3 className={`text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b ${
                darkMode ? "text-slate-400 border-slate-700/40" : "text-slate-500 border-gray-100"
              }`}>
                <FaFileAlt size={14} className={darkMode ? "text-orange-400" : "text-orange-600"} /> Datos del Reporte
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">ID Reporte</span>
                  <span className={`text-sm font-black mt-1 block ${darkMode ? "text-white" : "text-slate-900"}`}>
                    #{formData.id_report || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">T&eacute;cnico</span>
                  <span className={`text-sm font-black mt-1 block ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {loggedUserName}
                  </span>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-2xl border ${
              darkMode ? "bg-slate-800/20 border-slate-700/30" : "bg-white border-gray-200/60 shadow-sm"
            } space-y-4`}>
              <h3 className={`text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b ${
                darkMode ? "text-slate-400 border-slate-700/40" : "text-slate-500 border-gray-100"
              }`}>
                <FaClock size={14} className={darkMode ? "text-orange-400" : "text-orange-600"} /> Resoluci&oacute;n
              </h3>
              <div>
                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Hora</span>
                <span className={`text-sm font-black mt-1 block ${darkMode ? "text-white" : "text-slate-900"}`}>
                  {formData.tiempo || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border ${
            darkMode ? "bg-slate-800/20 border-slate-700/30" : "bg-white border-gray-200/60 shadow-sm"
          } space-y-4`}>
            <h3 className={`text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b ${
              darkMode ? "text-slate-400 border-slate-700/40" : "text-slate-500 border-gray-100"
            }`}>
              <FaWrench size={14} className={darkMode ? "text-orange-400" : "text-orange-600"} /> Diagn&oacute;stico
            </h3>
            <div>
              <span className={`text-sm font-black mt-1 block ${darkMode ? "text-white" : "text-slate-900"}`}>
                {formData.caso_tecnico || "N/A"}
              </span>
            </div>
            <div className="pt-4">
              <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Resoluci&oacute;n aplicada</span>
              <span className={`text-sm font-black mt-1 block ${darkMode ? "text-white" : "text-slate-900"}`}>
                {formData.resolucion || "N/A"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}><FaHashtag className="inline mb-1 mr-1"/> ID Reporte Relacionado</label>
              <input type="text" value={formData.id_report} disabled={true} className={`${inputClass} opacity-60`} />
            </div>
            <div>
              <label className={labelClass}><FaUserTie className="inline mb-1 mr-1"/> Técnico Responsable</label>
              <input type="text" value={`${formData.id_user} - ${loggedUserName}`} disabled={true} className={`${inputClass} opacity-60`} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}><FaWrench className="inline mb-1 mr-1"/> Diagnóstico / Caso Técnico</label>
              <input type="text" name="caso_tecnico" value={formData.caso_tecnico} onChange={handleInputChange} disabled={isReadOnly} placeholder="Resumen del fallo técnico..." className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}><FaCheckCircle className="inline mb-1 mr-1"/> Resolución Detallada</label>
              <textarea name="resolucion" rows="3" value={formData.resolucion} onChange={handleInputChange} disabled={isReadOnly} placeholder="Describa la solución aplicada..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><FaClock className="inline mb-1 mr-1"/> Hora de la Resolución</label>
              <input type="time" name="tiempo" value={formData.tiempo} onChange={handleInputChange} disabled={isReadOnly} className={inputClass} />
            </div>
            {!isReadOnly && (
              <div className="md:col-span-2 flex flex-col md:flex-row justify-end gap-3 pt-4 border-t border-gray-700/30">
                <button type="button" onClick={onClose} className={`flex-1 md:flex-none h-11 px-8 flex items-center justify-center gap-2 rounded-xl text-[11px] font-black transition-all uppercase shadow-sm active:scale-95 border-2 ${darkMode ? "bg-transparent border-red-600 text-red-500 hover:bg-red-600 hover:text-white" : "bg-white border-red-600 text-red-600 hover:bg-red-600 hover:text-white"}`}><FaTrash size={12} /> Cancelar</button>
                <button onClick={sendForm} disabled={isLoading} className={`flex-1 md:flex-none h-11 px-10 flex items-center justify-center gap-2 rounded-xl text-[11px] font-black transition-all uppercase shadow-md active:scale-95 text-white ${darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-[#1a1a1a] hover:bg-blue-700"} disabled:opacity-50`}>{isLoading ? "Procesando..." : <><FaSave size={14}/> Guardar Informe</>}</button>
              </div>
            )}
          </div>
        </div>
      )}
      <LoadingModal isOpen={modalState.isOpen} status={modalState.status} message={modalState.message} onClose={handleModalClose} />
    </>
  );
});

export default Techreport;
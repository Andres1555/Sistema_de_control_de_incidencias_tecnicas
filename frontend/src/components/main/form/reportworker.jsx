import React, { useState, forwardRef, useEffect } from "react";
import { FaTrash, FaPaperPlane, FaSave, FaBriefcase, FaClipboardList, FaDesktop, FaUser, FaWindows, FaKey, FaCalendarAlt, FaTag, FaBuilding } from "react-icons/fa";
import LoadingModal from "@/hooks/Modals/LoadingModal";

const ReportWorker = forwardRef(({ onSuccess, onClose, initialData, isEdit = false, readOnlyDefault = false, darkMode = false }, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const initialFormData = {
    caso: "",
    id_maquina: "", 
    area: "",
    estado: "en espera",
    cargo: "", 
    tipo: "",
    descripcion: "",
    nombre_natural: "",
    nombre_windows: "", 
    clave_natural: "",
    clave_win: "",
    fecha: getTodayDate(), 
  };

  const [formData, setFormData] = useState(initialData || initialFormData);
  const [modalState, setModalState] = useState({ isOpen: false, status: "loading", message: "" });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        estado: initialData.estado || "en espera",
        id_maquina: initialData.Machine?.nro_maquina ?? initialData.nro_maquina ?? initialData.id_maquina ?? "",
        nombre_windows: initialData.nombre_windows ?? "", 
        clave_win: initialData.clave_win ?? initialData.clave_acceso_windows ?? "",
        cargo: initialData.cargo ?? "",
        tipo: initialData.tipo ?? "",
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendForm = async () => {
    
    const required = ["caso", "id_maquina", "area", "tipo", "descripcion", "fecha", "cargo"];
    for (const key of required) {
      if (!formData[key]) {
        setModalState({ isOpen: true, status: "error", message: `El campo ${key.toUpperCase()} es obligatorio.` });
        return;
      }
    }

    setIsLoading(true);
    setModalState({ isOpen: true, status: "loading", message: "Enviando reporte..." });

    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };

      const isUpdating = isEdit && initialData?.id;
      const url = isUpdating ? `${base}/api/report/${initialData.id}` : `${base}/api/report`;
      
      const payload = {
        ...formData,
        nro_maquina: String(formData.id_maquina),
        id_maquina: Number(formData.id_maquina),
        nombre_windows: String(formData.nombre_windows),
        cargo: String(formData.cargo) // INCLUIMOS CARGO EN EL ENVÍO
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

  const inputClass = `w-full p-2.5 rounded-xl border outline-none transition-all font-bold ${
    darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-600"
  } ${readOnlyDefault ? "bg-transparent border-transparent cursor-default font-black text-lg" : "border-solid shadow-sm"}`;

  const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`;

  return (
    <>
      {readOnlyDefault ? (
        <div className="space-y-6 animate-fade-in p-6 md:p-8">
          <div className={`p-6 rounded-2xl border transition-all ${
            darkMode ? "bg-slate-800/40 border-slate-700/50" : "bg-gray-50 border-gray-200"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <FaClipboardList className={darkMode ? "text-blue-400" : "text-blue-600"} size={16} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                Detalles del Reporte
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black leading-tight">
              {formData.caso || "Sin t&iacute;tulo"}
            </h2>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className={`px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                formData.estado?.toLowerCase() === 'resuelto' 
                  ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                  : formData.estado?.toLowerCase() === 'en revision'
                  ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              }`}>
                Estado: {formData.estado || 'No definido'}
              </span>
              {formData.tipo && (
                <span className={`px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  darkMode ? 'bg-slate-700/50 text-slate-300 border border-slate-600/30' : 'bg-white text-gray-700 border border-gray-200 shadow-sm'
                }`}>
                  <FaTag size={10} /> {formData.tipo}
                </span>
              )}
              <span className={`px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                darkMode ? 'bg-slate-700/50 text-slate-300 border border-slate-600/30' : 'bg-white text-gray-700 border border-gray-200 shadow-sm'
              }`}>
                <FaCalendarAlt size={10} /> {formData.fecha || 'No definida'}
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
                <FaDesktop size={14} className={darkMode ? "text-blue-400" : "text-blue-600"} /> Ubicaci&oacute;n e Informaci&oacute;n
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">N&ordm; M&aacute;quina</span>
                  <span className={`text-base font-black mt-1 block ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {formData.id_maquina || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest"><FaBuilding size={9} className="inline mr-1" /> &Aacute;rea</span>
                  <span className={`text-base font-black mt-1 block ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {formData.area || "N/A"}
                  </span>
                </div>
                <div className="pt-2">
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest"><FaBriefcase size={9} className="inline mr-1" /> Cargo</span>
                  <span className={`text-base font-black mt-1 block ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {formData.cargo || "N/A"}
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
                <FaKey size={14} className={darkMode ? "text-blue-400" : "text-blue-600"} /> Credenciales de Acceso
              </h3>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
                <div>
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <FaUser size={9} /> Nombre Natural
                  </span>
                  <span className={`text-sm font-black mt-1 block truncate ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {formData.nombre_natural || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Clave Natural</span>
                  <span className={`font-mono text-xs font-black px-2 py-1 rounded-lg mt-1 inline-block tracking-wider ${
                    darkMode ? "bg-slate-700/40 text-blue-400" : "bg-gray-100 text-blue-600"
                  }`}>
                    {formData.clave_natural || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <FaWindows size={10} /> Nombre Windows
                  </span>
                  <span className={`text-sm font-black mt-1 block truncate ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {formData.nombre_windows || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Clave Windows</span>
                  <span className={`font-mono text-xs font-black px-2 py-1 rounded-lg mt-1 inline-block tracking-wider ${
                    darkMode ? "bg-slate-700/40 text-blue-400" : "bg-gray-100 text-blue-600"
                  }`}>
                    {formData.clave_win || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border ${
            darkMode ? "bg-slate-800/20 border-slate-700/30" : "bg-white border-gray-200/60 shadow-sm"
          }`}>
            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
              Descripci&oacute;n del Problema
            </span>
            <p className={`text-sm leading-relaxed font-bold whitespace-pre-wrap ${darkMode ? "text-slate-200" : "text-gray-700"}`}>
              {formData.descripcion || "Sin descripci&oacute;n proporcionada."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Título de la Falla</label>
              <input type="text" name="caso" value={formData.caso} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} placeholder="Ej: Monitor no enciende" />
            </div>

            <div>
              <label className={labelClass}>Número de Máquina</label>
              <input type="text" name="id_maquina" value={formData.id_maquina} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} placeholder="Ej: 102" />
            </div>

            <div>
              <label className={labelClass}>Área de Trabajo</label>
              <input type="text" name="area" value={formData.area} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} placeholder="Ej: Reducción" />
            </div>

            <div>
              <label className={labelClass}>Tipo de Incidencia</label>
              <select name="tipo" value={formData.tipo} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass}>
                <option value="">Seleccione...</option>
                <option value="Redes">Redes</option>
                <option value="Avería">Avería</option>
                <option value="Periféricos">Periféricos</option>
                <option value="Solicitud">Solicitud</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Cargo de quien reporta</label>
              <input type="text" name="cargo" value={formData.cargo} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} placeholder="Ej: Operador / Analista" />
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
              <button type="button" onClick={onClose} className={`flex-1 md:flex-none h-11 px-8 flex items-center justify-center gap-2 rounded-xl text-[11px] font-black transition-all uppercase shadow-sm active:scale-95 border-2 ${darkMode ? "bg-transparent border-red-600 text-red-500 hover:bg-red-600 hover:text-white" : "bg-white border-red-600 text-red-600 hover:bg-red-600 hover:text-white"}`}><FaTrash size={12} /> Cancelar</button>
              <button type="button" onClick={sendForm} disabled={isLoading} className={`flex-1 md:flex-none h-11 px-10 flex items-center justify-center gap-2 rounded-xl text-[11px] font-black transition-all uppercase shadow-md active:scale-95 text-white ${darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-[#1a1a1a] hover:bg-blue-700"} disabled:opacity-50`}>{isEdit ? <FaSave size={14} /> : <FaPaperPlane size={14} />}{isLoading ? "Procesando..." : (isEdit ? "Guardar Cambios" : "Enviar Reporte")}</button>
            </div>
          )}
        </div>
      )}

      <LoadingModal isOpen={modalState.isOpen} status={modalState.status} message={modalState.message} onClose={() => { if (modalState.status === "success" && formSubmitted) { onSuccess?.(); onClose?.(); } setModalState(s => ({ ...s, isOpen: false })); }} />
    </>
  );
});

export default ReportWorker;
import React, { useState, forwardRef, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, Box, IconButton, Typography, Button, DialogActions } from "@mui/material"; 
import LoadingModal from "@/hooks/Modals/LoadingModal";
import Techreport from "./techreport";
import CloseIcon from "@mui/icons-material/Close";
import { 
  FaTrash, FaSave, FaPlus, FaWindows, FaDesktop, 
  FaBriefcase, FaCheckCircle, FaCalendarAlt, 
  FaUser, FaKey, FaClipboardList, FaBuilding, FaTag 
} from "react-icons/fa";

const Reportform = forwardRef(({ onSuccess, onClose, initialData, isEdit = false, readOnlyDefault = false, darkMode = false }, ref) => {
  // --- ESTADOS ---
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Obtener fecha de hoy en formato YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy}`;
  };

  const initialFormData = {
    caso: "",
    id_maquina: "", 
    area: "",
    estado: "en espera",
    cargo: "", // --- NUEVO ATRIBUTO ---
    descripcion: "",
    nombre_natural: "",
    nombre_windows: "", 
    clave_natural: "",
    clave_win: "",
    fecha: getTodayDate(), 
    resuelto_por: null,
    resuelto_por_nombre: null,
  };

  const [formData, setFormData] = useState(initialData || initialFormData);
  const [showTechDialog, setShowTechDialog] = useState(false);
  const [techInitialData, setTechInitialData] = useState(null);

  const [modalState, setModalState] = useState({
    isOpen: false,
    status: "loading",
    message: "",
  });

  // --- SINCRONIZACIÓN DE DATOS ---
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        id_maquina: initialData.Machine?.nro_maquina ?? initialData.nro_maquina ?? initialData.id_maquina ?? "",
        nombre_windows: initialData.nombre_windows ?? initialData['nombre windows'] ?? initialData.nombreWindows ?? "", 
        clave_win: initialData.clave_win ?? initialData.clave_acceso_windows ?? initialData['clave de acceso windows'] ?? "",
        clave_natural: initialData.clave_natural ?? initialData['clave natural'] ?? "",
        cargo: initialData.cargo ?? "", 
        resuelto_por: initialData.resuelto_por ?? null,
        resuelto_por_nombre: initialData.resuelto_por_nombre ?? null,
        fecha: initialData.fecha ? (() => {
            const [y, m, d] = initialData.fecha.split('-');
            return `${d}/${m}/${y}`;
        })() : getTodayDate(), 
      });
    } else {
      setFormData(initialFormData);
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const token = localStorage.getItem("token");
  const currentUser = decodeToken(token);
  const userRole = (currentUser?.rol || currentUser?.role || "").toLowerCase();

  const handleClaim = async () => {
    setIsLoading(true);
    setModalState({ isOpen: true, status: "loading", message: "Asignando reporte..." });
    try {
      const token = localStorage.getItem("token");
      const headers = { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };
      const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const url = `${base}/api/report/${initialData.id}/claim`;

      const res = await fetch(url, {
        method: "PATCH",
        headers,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error al reclamar el reporte");

      setModalState({ 
        isOpen: true, 
        status: "success", 
        message: "¡Has tomado el reporte para resolverlo!" 
      });

      // Actualizar el estado del formulario con el reporte actualizado
      const updatedReport = result.report;
      setFormData(prev => ({
        ...prev,
        resuelto_por: updatedReport.resuelto_por,
        resuelto_por_nombre: updatedReport.resuelto_por_nombre,
        estado: updatedReport.estado
      }));

      // Llamar onSuccess para refrescar la lista de reportes en el fondo
      onSuccess?.();

    } catch (err) {
      setModalState({ isOpen: true, status: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenTechDialog = () => {
    setTechInitialData({ 
      id_user: currentUser?.id ?? "", 
      id_report: initialData?.id ?? "" 
    });
    setShowTechDialog(true);
  };

  // --- ENVÍO DEL FORMULARIO ---
  const sendForm = async () => {
    const required = ["caso", "id_maquina", "area", "estado", "descripcion", "fecha"];
    for (const key of required) {
      if (!formData[key] && formData[key] !== 0) {
        setModalState({ isOpen: true, status: "error", message: "Complete los campos obligatorios." });
        return;
      }
    }

    setIsLoading(true);
    setModalState({ isOpen: true, status: "loading", message: "Procesando solicitud..." });

    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';

      const isUpdating = isEdit && initialData?.id;
      const url = isUpdating ? `${base}/api/report/${initialData.id}` : `${base}/api/report`;
      
      const payload = {
        ...formData,
        fecha: (() => {
            if (formData.fecha && formData.fecha.includes('/')) {
                const [d, m, y] = formData.fecha.split('/');
                return `${y}-${m}-${d}`;
            }
            return formData.fecha;
        })(),
        nro_maquina: String(formData.id_maquina),
        id_maquina: Number(formData.id_maquina),
        nombre_windows: String(formData.nombre_windows),
        cargo: String(formData.cargo) // --- ENVIAR DATO CARGO ---
      };

      const res = await fetch(url, {
        method: isUpdating ? "PUT" : "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Error en el servidor");

      const reportId = result?.report?.id || result?.data?.id || initialData?.id;

      setModalState({ 
          isOpen: true, 
          status: "success", 
          message: isUpdating ? "Reporte actualizado exitosamente" : "Reporte creado exitosamente" 
      });

      if (formData.estado === 'resuelto') {
        setTechInitialData({ 
          id_user: decodeToken(token)?.id ?? "", 
          id_report: reportId 
        });
        setFormSubmitted(false);
      } else {
        setFormSubmitted(true);
      }
    } catch (err) {
      setModalState({ isOpen: true, status: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    const wasResuelto = formData.estado === 'resuelto';
    const isSuccess = modalState.status === "success";
    setModalState(s => ({ ...s, isOpen: false }));
    if (isSuccess) {
      if (wasResuelto) setShowTechDialog(true);
      else {
        onSuccess?.();
        onClose?.();
      }
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
          {/* Header/Title block */}
          <div className={`p-6 rounded-2xl border transition-all ${
            darkMode ? "bg-slate-800/40 border-slate-700/50" : "bg-gray-50 border-gray-200"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <FaClipboardList className={darkMode ? "text-blue-400" : "text-blue-600"} size={16} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                Detalles de la Incidencia
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black leading-tight">
              {formData.caso || "Sin título"}
            </h2>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className={`px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                formData.estado?.toLowerCase() === 'resuelto' 
                  ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                  : formData.estado?.toLowerCase() === 'en revision'
                  ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                  : formData.estado?.toLowerCase() === 'en espera'
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}>
                Estado: {formData.estado || 'No definido'}
              </span>
              <span className={`px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                darkMode ? 'bg-slate-700/50 text-slate-300 border border-slate-600/30' : 'bg-white text-gray-700 border border-gray-200 shadow-sm'
              }`}>
                <FaTag size={10} /> {formData.tipo || 'No especificado'}
              </span>
              <span className={`px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                darkMode ? 'bg-slate-700/50 text-slate-300 border border-slate-600/30' : 'bg-white text-gray-700 border border-gray-200 shadow-sm'
              }`}>
                <FaCalendarAlt size={10} /> {formData.fecha || 'No definida'}
              </span>
            </div>
          </div>

          {/* Grid for Technical Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Machine & Area details */}
            <div className={`p-6 rounded-2xl border ${
              darkMode ? "bg-slate-800/20 border-slate-700/30" : "bg-white border-gray-200/60 shadow-sm"
            } space-y-4`}>
              <h3 className={`text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b ${
                darkMode ? "text-slate-400 border-slate-700/40" : "text-slate-500 border-gray-100"
              }`}>
                <FaDesktop size={14} className={darkMode ? "text-blue-400" : "text-blue-600"} /> Ubicación e Información de Rol
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Nº Máquina</span>
                  <span className={`text-base font-black mt-1 block ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {formData.id_maquina || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Área / Depto</span>
                  <span className={`text-base font-black mt-1 block ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {formData.area || "N/A"}
                  </span>
                </div>
                <div className="col-span-2 pt-2">
                  <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FaBriefcase size={10} /> Cargo de Reportante
                  </span>
                  <span className={`text-base font-black mt-1 block ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {formData.cargo || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: User Access & Credentials details */}
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

          {/* Detailed Description Block */}
          <div className={`p-6 rounded-2xl border ${
            darkMode ? "bg-slate-800/20 border-slate-700/30" : "bg-white border-gray-200/60 shadow-sm"
          }`}>
            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
              Descripción del Problema
            </span>
            <p className={`text-sm leading-relaxed font-bold whitespace-pre-wrap ${darkMode ? "text-slate-200" : "text-gray-700"}`}>
              {formData.descripcion || "Sin descripción proporcionada."}
            </p>
          </div>

          {/* Action Resolution footer */}
          <div className="pt-2">
            {formData.estado?.toLowerCase() !== 'resuelto' && (
              <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border transition-all ${
                formData.resuelto_por 
                  ? (formData.resuelto_por === currentUser?.id 
                      ? "bg-green-500/10 border-green-500/20 text-green-500" 
                      : "bg-amber-500/10 border-amber-500/20 text-amber-500") 
                  : "bg-blue-500/10 border-blue-500/20 text-blue-500"
              } backdrop-blur-md`}>
                <div className="flex flex-col">
                  {formData.resuelto_por ? (
                    formData.resuelto_por === currentUser?.id ? (
                      <>
                        <span className="text-[10px] font-black uppercase tracking-wider text-green-500">Estado de Resolución</span>
                        <span className={`text-sm font-black mt-1 ${darkMode ? "text-green-400" : "text-green-700"}`}>
                          Este reporte está siendo resuelto por ti.
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">Estado de Resolución</span>
                        <span className={`text-sm font-black mt-1 ${darkMode ? "text-amber-400" : "text-amber-700"}`}>
                          Este reporte está siendo resuelto por <span className="underline font-black">{formData.resuelto_por_nombre || "otro técnico"}</span>.
                        </span>
                      </>
                    )
                  ) : (
                    <>
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-500">Reporte Libre</span>
                      <span className={`text-sm font-black mt-1 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                        Nadie está resolviendo este reporte aún.
                      </span>
                    </>
                  )}
                </div>

                {/* Botón de Resolver */}
                {userRole !== 'worker' && !formData.resuelto_por && (
                  <button
                    type="button"
                    onClick={handleClaim}
                    disabled={isLoading}
                    className="w-full sm:w-auto h-11 px-8 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black uppercase text-xs transition-all shadow-lg shadow-green-500/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    Resolver Reporte
                  </button>
                )}

                {/* Botón de Listo / Registrar Caso Técnico */}
                {userRole !== 'worker' && formData.resuelto_por && formData.resuelto_por === currentUser?.id && (
                  <button
                    type="button"
                    onClick={handleOpenTechDialog}
                    className="w-full sm:w-auto h-11 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black uppercase text-xs transition-all shadow-lg shadow-green-500/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <FaCheckCircle size={14} /> Listo / Resolver
                  </button>
                )}
              </div>
            )}
            
            {formData.estado?.toLowerCase() === 'resuelto' && (
              <div className="p-5 rounded-2xl bg-green-500/10 border border-green-500/20 text-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-green-500 block mb-1">Reporte Resuelto</span>
                <p className={`text-sm font-black ${darkMode ? "text-green-400" : "text-green-700"}`}>
                  Este reporte fue resuelto {formData.resuelto_por_nombre ? `por ${formData.resuelto_por_nombre}` : ""}.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Título del Caso / Incidencia</label>
              <input type="text" name="caso" value={formData.caso} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} placeholder="Ej: Falla de red..." />
            </div>

            <div>
              <label className={labelClass}><FaDesktop className="inline mb-1 mr-1"/> Número de la Máquina</label>
              <input type="text" name="id_maquina" value={formData.id_maquina} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Área / Departamento</label>
              <input type="text" name="area" value={formData.area} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} />
            </div>

            {isEdit && (
            <div>
              <label className={labelClass}>Estado del Reporte</label>
              <select name="estado" value={formData.estado} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass}>
                <option value="">Seleccione...</option>
                <option value="resuelto">Resuelto</option>
                <option value="en revision">En revisión</option>
                <option value="en espera">En espera</option>
                <option value="escalado">Escalado</option>
              </select>
            </div>
            )}

            <div>
              <label className={labelClass}>Tipo de Incidencia</label>
              <select name="tipo" value={formData.tipo} onChange={handleInputChange} className={inputClass}>
                <option value="">Seleccione...</option>
                <option value="Redes">Redes</option>
                <option value="Avería">Avería</option>
                <option value="Periféricos">Periféricos</option>
                <option value="Solicitud">Solicitud</option>
              </select>
            </div>

            {/* --- CAMPO CARGO --- */}
            <div>
              <label className={labelClass}><FaBriefcase className="inline mb-1 mr-1"/> Cargo</label>
              <input type="text" name="cargo" value={formData.cargo} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} placeholder="Ej: Analista de sistemas" />
            </div>

            <div>
              <label className={labelClass}>Fecha (Automática)</label>
              <input 
                type="text" 
                name="fecha" 
                value={formData.fecha} 
                readOnly 
                className={`${inputClass} bg-gray-200/20 cursor-not-allowed`} 
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Descripción Detallada</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} disabled={readOnlyDefault} rows="3" className={inputClass} placeholder="Explique el problema..." />
            </div>

            <div>
              <label className={labelClass}>Nombre Natural</label>
              <input type="text" name="nombre_natural" value={formData.nombre_natural} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}><FaWindows className="inline mb-1 mr-1"/> Nombre Windows</label>
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

          <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t border-gray-700/30">
            <button type="button" onClick={onClose} className={`flex-1 md:flex-none h-11 px-8 flex items-center justify-center gap-2 rounded-xl text-[11px] font-black transition-all uppercase shadow-sm active:scale-95 border-2 ${darkMode ? "bg-transparent border-red-600 text-red-500 hover:bg-red-600 hover:text-white" : "bg-white border-red-600 text-red-600 hover:bg-red-600 hover:text-white"}`}><FaTrash size={12} /> Cancelar</button>
            <button type="button" onClick={sendForm} disabled={isLoading} className={`flex-1 md:flex-none h-11 px-10 flex items-center justify-center gap-2 rounded-xl text-[11px] font-black transition-all uppercase shadow-md active:scale-95 text-white ${darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-[#1a1a1a] hover:bg-blue-700"} disabled:opacity-50`}>{isEdit ? <FaSave size={14} /> : <FaPlus size={14} />}{isLoading ? "Procesando..." : (isEdit ? "Guardar Cambios" : "Crear Reporte")}</button>
          </div>
        </div>
      )}

      <Dialog open={showTechDialog} onClose={() => setShowTechDialog(false)} maxWidth="md" fullWidth PaperProps={{ style: { backgroundColor: darkMode ? '#1e293b' : '#ffffff', borderRadius: '24px' } }}>
        <DialogTitle className="flex justify-between items-center p-6"><span className="font-black uppercase text-xs tracking-widest opacity-60">Registrar resolución técnica</span><IconButton onClick={() => setShowTechDialog(false)}><CloseIcon/></IconButton></DialogTitle>
        <DialogContent dividers sx={{ borderColor: darkMode ? '#334155' : '#f1f5f9' }}>
          <Techreport initialData={techInitialData} onSuccess={() => { setShowTechDialog(false); onSuccess?.(); onClose?.(); }} onClose={() => setShowTechDialog(false)} darkMode={darkMode} />
        </DialogContent>
      </Dialog>

      <LoadingModal isOpen={modalState.isOpen} status={modalState.status} message={modalState.message} onClose={handleModalClose} />
    </>
  );
});

export default Reportform;
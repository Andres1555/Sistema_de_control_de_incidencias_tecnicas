import React, { useState, forwardRef, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, Box, IconButton, Typography, Button, DialogActions } from "@mui/material"; 
import LoadingModal from "@/hooks/Modals/LoadingModal";
import Techreport from "./techreport";
import CloseIcon from "@mui/icons-material/Close";
import { FaTrash, FaSave, FaPlus, FaWindows, FaDesktop, FaBriefcase } from "react-icons/fa";

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
    return `${yyyy}-${mm}-${dd}`;
  };

  const initialFormData = {
    caso: "",
    id_maquina: "", 
    area: "",
    estado: "",
    cargo: "", // --- NUEVO ATRIBUTO ---
    descripcion: "",
    nombre_natural: "",
    nombre_windows: "", 
    clave_natural: "",
    clave_win: "",
    fecha: getTodayDate(), 
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
        fecha: initialData.fecha || getTodayDate(), 
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
      <div className="space-y-6 animate-fade-in p-1">
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

          {/* --- CAMPO CARGO --- */}
          <div>
            <label className={labelClass}><FaBriefcase className="inline mb-1 mr-1"/> Cargo</label>
            <input type="text" name="cargo" value={formData.cargo} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} placeholder="Ej: Analista de sistemas" />
          </div>

          <div>
            <label className={labelClass}>Fecha</label>
            <input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} />
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

        {!readOnlyDefault && (
          <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t border-gray-700/30">
            <button type="button" onClick={onClose} className={`flex-1 md:flex-none h-11 px-8 flex items-center justify-center gap-2 rounded-xl text-[11px] font-black transition-all uppercase shadow-sm active:scale-95 border-2 ${darkMode ? "bg-transparent border-red-600 text-red-500 hover:bg-red-600 hover:text-white" : "bg-white border-red-600 text-red-600 hover:bg-red-600 hover:text-white"}`}><FaTrash size={12} /> Cancelar</button>
            <button type="button" onClick={sendForm} disabled={isLoading} className={`flex-1 md:flex-none h-11 px-10 flex items-center justify-center gap-2 rounded-xl text-[11px] font-black transition-all uppercase shadow-md active:scale-95 text-white ${darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-[#1a1a1a] hover:bg-blue-700"} disabled:opacity-50`}>{isEdit ? <FaSave size={14} /> : <FaPlus size={14} />}{isLoading ? "Procesando..." : (isEdit ? "Guardar Cambios" : "Crear Reporte")}</button>
          </div>
        )}
      </div>

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
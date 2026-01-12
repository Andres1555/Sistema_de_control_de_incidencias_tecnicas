import React, { useState, forwardRef, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import LoadingModal from "@/hooks/Modals/LoadingModal";
import Techreport from "./techreport";

const Reportform = forwardRef(({ onSuccess, onClose, initialData, isEdit = false, readOnlyDefault = false, darkMode = false }, ref) => {
  // --- ESTADOS ---
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const initialFormData = {
    caso: "",
    id_maquina: "",
    area: "",
    estado: "",
    descripcion: "",
    nombre_natural: "",
    clave_natural: "",
    clave_win: "",
    fecha: "",
  };

  const [formData, setFormData] = useState(initialData || initialFormData);
  const [showTechPrompt, setShowTechPrompt] = useState(false);
  const [showTechDialog, setShowTechDialog] = useState(false);
  const [createdReport, setCreatedReport] = useState(null);
  const [techInitialData, setTechInitialData] = useState(null);

  const [modalState, setModalState] = useState({
    isOpen: false,
    status: "loading",
    message: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        clave_win: initialData.clave_win ?? initialData.clave_acceso_windows ?? "",
        id_maquina: initialData.id_maquina ?? initialData.nro_maquina ?? "",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [initialData]);

  // --- HELPERS ---
  const decodeToken = (token) => {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(json);
    } catch (e) { return null; }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinueToTech = () => {
    const token = localStorage.getItem('token');
    const decoded = decodeToken(token);
    setTechInitialData({ id_user: decoded?.id ?? "", id_report: createdReport?.id ?? "" });
    setShowTechPrompt(false);
    setShowTechDialog(true);
  };

  const handleTechSuccess = () => {
    setShowTechDialog(false);
    onSuccess?.();
    onClose?.();
    setModalState({ isOpen: true, status: "success", message: "Reporte técnico creado correctamente." });
  };

  // --- ENVÍO ---
  const sendForm = async () => {
    const required = ["caso", "id_maquina", "area", "estado", "descripcion", "fecha"];
    for (const key of required) {
      if (!formData[key] && formData[key] !== 0) {
        setModalState({ isOpen: true, status: "error", message: "Complete los campos obligatorios." });
        return;
      }
    }

    setIsLoading(true);
    setModalState({ isOpen: true, status: "loading", message: "Procesando..." });

    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';

      const isUpdating = isEdit && initialData?.id;
      const url = isUpdating ? `${base}/api/report/${initialData.id}` : `${base}/api/report`;
      
      const payload = {
        ...formData,
        nro_maquina: Number(formData.id_maquina),
        id_maquina: Number(formData.id_maquina)
      };

      const res = await fetch(url, {
        method: isUpdating ? "PUT" : "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Error en el servidor");

      if (formData.estado === 'resuelto') {
        setCreatedReport(result?.report || result?.data || null);
        setModalState({ isOpen: true, status: "success", message: "Reporte guardado. Debe crear el reporte técnico." });
        setShowTechPrompt(true);
      } else {
        setFormSubmitted(true);
        setModalState({ isOpen: true, status: "success", message: "Operación realizada con éxito." });
      }
    } catch (err) {
      setModalState({ isOpen: true, status: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // --- ESTILOS (IGUALES A WORKER/USER FORM) ---
  const inputClass = `w-full p-2.5 rounded-lg border outline-none transition-all ${
    darkMode 
      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" 
      : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-600"
  } ${readOnlyDefault ? "bg-transparent border-transparent cursor-default font-semibold text-lg" : "border-solid shadow-sm"}`;

  const labelClass = `block text-[10px] font-bold uppercase tracking-widest mb-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`;

  return (
    <>
      <div className="space-y-6 animate-fade-in p-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Caso */}
          <div className="md:col-span-2">
            <label className={labelClass}>Título del Caso / Incidencia</label>
            <input type="text" name="caso" value={formData.caso} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} placeholder="Ej: Falla de red..." />
          </div>

          {/* ID Maquina */}
          <div>
            <label className={labelClass}>Número de la Máquina</label>
            <input type="number" name="id_maquina" value={formData.id_maquina} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} />
          </div>

          {/* Área */}
          <div>
            <label className={labelClass}>Área / Departamento</label>
            <input type="text" name="area" value={formData.area} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} />
          </div>

          {/* Estado */}
          <div>
            <label className={labelClass}>Estado del Reporte</label>
            <select name="estado" value={formData.estado} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass}>
              <option value="">Seleccione...</option>
              <option value="resuelto">Resuelto</option>
              <option value="en revision">En revisión</option>
              <option value="en espera">En espera</option>
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className={labelClass}>Fecha</label>
            <input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} />
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className={labelClass}>Descripción Detallada</label>
            <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} disabled={readOnlyDefault} rows="3" className={inputClass} placeholder="Explique el problema..." />
          </div>

          {/* Nombre Natural */}
          <div>
            <label className={labelClass}>Nombre Natural</label>
            <input type="text" name="nombre_natural" value={formData.nombre_natural} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} />
          </div>

          {/* Clave Natural */}
          <div>
            <label className={labelClass}>Clave Natural</label>
            <input type="text" name="clave_natural" value={formData.clave_natural} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} />
          </div>

          {/* Clave Win */}
          <div>
            <label className={labelClass}>Clave Windows</label>
            <input type="text" name="clave_win" value={formData.clave_win} onChange={handleInputChange} disabled={readOnlyDefault} className={inputClass} />
          </div>
        </div>

        {/* Botones de acción */}
        {!readOnlyDefault && (
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-700/30">
            <button type="button" onClick={onClose} className={`px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-500/10 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Cancelar
            </button>
            <button 
              type="button" 
              onClick={sendForm} 
              disabled={isLoading} 
              className="bg-blue-600 text-white px-8 py-2 rounded-md font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? "Enviando..." : (isEdit ? "Guardar Cambios" : "Crear Reporte")}
            </button>
          </div>
        )}
      </div>

      {/* Dialogs de Flujo Técnico */}
      <Dialog open={showTechPrompt} onClose={() => setShowTechPrompt(false)}>
        <DialogTitle>Crear reporte técnico</DialogTitle>
        <DialogContent>
          <Typography>El reporte fue guardado como "resuelto". ¿Desea crear el reporte técnico ahora?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowTechPrompt(false); onSuccess?.(); onClose?.(); }}>Más tarde</Button>
          <Button onClick={handleContinueToTech} variant="contained">Continuar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showTechDialog} onClose={() => setShowTechDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Registrar reporte técnico</DialogTitle>
        <DialogContent>
          <Techreport initialData={techInitialData} onSuccess={handleTechSuccess} onClose={() => setShowTechDialog(false)} darkMode={darkMode} />
        </DialogContent>
      </Dialog>

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

export default Reportform;
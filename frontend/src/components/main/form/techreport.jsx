import React, { useState, forwardRef } from "react";
import {Box,Button,TextField,FormControl,InputLabel,Select,MenuItem,} from "@mui/material";
import LoadingModal from "@/hooks/Modals/LoadingModal"; 
// import axios from "axios"; // Descomentar si vas a usar axios directamente

const Techreport = forwardRef(({ onSuccess, onClose, initialData, isEdit = false, readOnlyDefault = false, darkMode = false }, ref) => {
  // --- ESTADOS ---
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const [isReadOnly, setIsReadOnly] = useState(Boolean(readOnlyDefault));

  // Campos esperados por el backend para ReportCase
  const initialFormData = {
    id_user: "",
    id_report: "",
    caso_tecnico: "",
    resolucion: "",
    tiempo: "",
  };

  const [formData, setFormData] = useState(initialData || initialFormData);

  React.useEffect(() => {
    setFormData(initialData || initialFormData);
    setIsReadOnly(Boolean(readOnlyDefault));
  }, [initialData, readOnlyDefault]);

  // Estado del Modal de Feedback
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: "loading", // 'loading' | 'success' | 'error'
    message: "",
  });

  // --- MANEJADORES ---

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- ENVÍO DEL FORMULARIO ---
  const sendForm = async () => {
    // Validaciones básicas
    const required = ["id_user","id_report","caso_tecnico","resolucion","tiempo"];
    for (const k of required) {
      if (!formData[k] && formData[k] !== 0) {
        setModalState({ isOpen: true, status: "error", message: "Complete todos los campos obligatorios." });
        return;
      }
    }

    const idUserNum = Number(formData.id_user);
    const idReportNum = Number(formData.id_report);
    if (isNaN(idUserNum) || isNaN(idReportNum)) {
      setModalState({ isOpen: true, status: "error", message: "id_user e id_report deben ser números válidos." });
      return;
    }

    setIsLoading(true);
    setModalState({
      isOpen: true,
      status: "loading",
      message: "Procesando solicitud...",
    });

    try {
      const payload = {
        id_user: Number(formData.id_user),
        id_report: Number(formData.id_report),
        caso_tecnico: String(formData.caso_tecnico),
        resolucion: String(formData.resolucion),
        tiempo: String(formData.tiempo),
      };

      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';

      // Si estamos editando un caso ya existente
      if (isEdit && initialData?.id) {
        console.log('Techreport sendForm - PUT', `${base}/api/report_cases/${initialData.id}`, { headers, payload });
        const res = await fetch(`${base}/api/report_cases/${initialData.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });

        let resultBody = null;
        try { resultBody = await res.json(); } catch (e) { /* ignore */ }

        if (!res.ok) {
          const serverMsg = (resultBody && resultBody.message) ? resultBody.message : res.statusText || 'Error en la petición';
          console.error('Techreport - server error (update)', res.status, serverMsg, resultBody);
          throw new Error(serverMsg);
        }

        setFormSubmitted(true);
        setModalState({ isOpen: true, status: 'success', message: resultBody?.message || 'Caso actualizado correctamente' });
        // notify parent and close
        onSuccess?.();
        return;
      }

      // LOG: mostrar headers y payload antes de enviar
      console.log('Techreport sendForm - POST', `${base}/api/report_cases`, { headers, payload });

      const res = await fetch(`${base}/api/report_cases`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      // Intentar parsear el cuerpo si hay alguno
      let resultBody = null;
      try {
        resultBody = await res.json();
      } catch (parseErr) {
        console.warn('Techreport - no se recibió JSON en la respuesta', parseErr);
      }

      if (!res.ok) {
        const serverMsg = (resultBody && resultBody.message) ? resultBody.message : res.statusText || 'Error en la petición';
        console.error('Techreport - server error', res.status, serverMsg, resultBody);
        throw new Error(serverMsg);
      }

      // 3. Éxito
      setFormSubmitted(true);
      setModalState({
        isOpen: true,
        status: "success",
        message: (resultBody && resultBody.message) ? resultBody.message : "Operación realizada correctamente",
      });

      console.error('Techreport - error:', err);
      setFormSubmitted(false);
      setModalState({
        isOpen: true,
        status: "error",
        message: err?.message || "Hubo un error al procesar la solicitud.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- LIMPIEZA Y CIERRE ---
  const clearForm = () => {
    setFormData(initialFormData);
  };

  const handleModalClose = () => {
    if (modalState.status === "success" && formSubmitted) {
      clearForm();
      onSuccess?.(); // Notificar al padre que terminó
      onClose?.();   // Cerrar el formulario si está en un modal/drawer
    }
    setModalState((s) => ({ ...s, isOpen: false }));
    setFormSubmitted(false);
  };

  return (
    <>
      <Box
        component="form"
        ref={ref}
        onSubmit={(e) => e.preventDefault()}
        className={darkMode ? 'bg-transparent text-gray-100' : ''}
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
          p: 1,
        }}
      >
        {/* Row 1 */}
      <TextField disabled={isReadOnly} label="ID Usuario" name="id_user" type="number" variant="filled" value={formData.id_user} onChange={handleInputChange} required InputProps={{ readOnly: true }} />
      <TextField disabled={isReadOnly} label="ID Reporte" name="id_report" type="number" variant="filled" value={formData.id_report} onChange={handleInputChange} required InputProps={{ readOnly: true }} />
        {/* Row 2 */}
        <TextField disabled={isReadOnly} label="Caso Técnico" name="caso_tecnico" variant="filled" multiline minRows={3} value={formData.caso_tecnico} onChange={handleInputChange} required />
        <TextField disabled={isReadOnly} label="Resolución" name="resolucion" variant="filled" multiline minRows={3} value={formData.resolucion} onChange={handleInputChange} required />

        {/* Row 3 */}
        <TextField disabled={isReadOnly} label="Tiempo" name="tiempo" type="time" variant="filled" value={formData.tiempo} onChange={handleInputChange} InputLabelProps={{ shrink: true }} required />
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button type="button" variant="contained" color="primary" fullWidth onClick={sendForm} disabled={isLoading || isReadOnly} sx={{ py: 2 }}>
            {isLoading ? "Cargando..." : (isEdit ? "Guardar cambios" : "Guardar")}
          </Button>
        </Box>
      </Box>

      {/* Modal de Feedback (Carga/Éxito/Error) */}
      <LoadingModal
        isOpen={modalState.isOpen}
        status={modalState.status}
        message={modalState.message}
        onClose={handleModalClose}
      />
    </>
  );
});

export default Techreport ;
import React, { useState, forwardRef } from "react";
import {Box,Button,TextField,FormControl,InputLabel,Select,MenuItem,} from "@mui/material";
import LoadingModal from "@/hooks/Modals/LoadingModal"; 
// import axios from "axios"; // Descomentar si vas a usar axios directamente

const Techreport = forwardRef(({ onSuccess, onClose, initialData }, ref) => {
  // --- ESTADOS ---
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Campos esperados por el backend para ReportCase
  const initialFormData = {
    id_user: "",
    id_report: "",
    caso_tecnico: "",
    resolucion: "",
    tiempo: "",
  };

  const [formData, setFormData] = useState(initialData || initialFormData);

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

      const res = await fetch('/api/report_cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || 'Error al crear report case');

      // 3. Éxito
      setFormSubmitted(true);
      setModalState({
        isOpen: true,
        status: "success",
        message: "Operación realizada correctamente",
      });

    } catch (err) {
      console.error(err);
      setFormSubmitted(false);
      setModalState({
        isOpen: true,
        status: "error",
        message: "Hubo un error al procesar la solicitud.",
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
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
          p: 1,
        }}
      >
        {/* Row 1 */}
        <TextField label="ID Usuario" name="id_user" type="number" variant="filled" value={formData.id_user} onChange={handleInputChange} required />
        <TextField label="ID Reporte" name="id_report" type="number" variant="filled" value={formData.id_report} onChange={handleInputChange} required />

        {/* Row 2 */}
        <TextField label="Caso Técnico" name="caso_tecnico" variant="filled" multiline minRows={3} value={formData.caso_tecnico} onChange={handleInputChange} required />
        <TextField label="Resolución" name="resolucion" variant="filled" multiline minRows={3} value={formData.resolucion} onChange={handleInputChange} required />

        {/* Row 3 */}
        <TextField label="Tiempo" name="tiempo" type="time" variant="filled" value={formData.tiempo} onChange={handleInputChange} InputLabelProps={{ shrink: true }} required />
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button type="button" variant="contained" color="primary" fullWidth onClick={sendForm} disabled={isLoading} sx={{ py: 2 }}>
            {isLoading ? "Cargando..." : "Guardar"}
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
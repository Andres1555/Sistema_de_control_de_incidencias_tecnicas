import React, { useState, forwardRef } from "react";
import {Box,Button,TextField,FormControl,InputLabel,Select,MenuItem,} from "@mui/material";
import LoadingModal from "@/hooks/Modals/LoadingModal"; 
// import axios from "axios"; // Descomentar si vas a usar axios directamente

const Techreport = forwardRef(({ onSuccess, onClose, initialData }, ref) => {
  // --- ESTADOS ---
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Define aquí los campos iniciales de tu formulario
  const initialFormData = {
    campo1: "",
    campo2: "",
    // ... más campos
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
    // 1. Validaciones básicas
    if (!formData.campo1) {
      setModalState({
        isOpen: true,
        status: "error",
        message: "Por favor, complete los campos obligatorios.",
      });
      return;
    }

    setIsLoading(true);
    setModalState({
      isOpen: true,
      status: "loading",
      message: "Procesando solicitud...",
    });

    try {
      // 2. Aquí iría tu llamada a la API
      // const res = await axios.post('/api/endpoint', formData);
      
      console.log("Enviando datos:", formData);
      
      // Simulación de espera
      await new Promise((resolve) => setTimeout(resolve, 1500));

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
          display: "flex",
          flexDirection: "column",
          gap: 3, // Espaciado vertical entre inputs
          overflowY: "auto",
          maxHeight: "65vh", // Altura máxima antes de hacer scroll
          p: 1,
          // Estilos del scrollbar
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-track": { background: "#f1f1f1" },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#888",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": { background: "#555" },
        }}
      >
        {/* --- AQUÍ EMPIEZAN TUS INPUTS --- */}

        {/* Ejemplo Input Texto */}
        <TextField
          fullWidth
          label="Nombre del Campo"
          name="campo1"
          variant="filled"
          value={formData.campo1}
          onChange={handleInputChange}
          required
        />

        {/* Ejemplo Select */}
        <FormControl variant="filled" fullWidth>
          <InputLabel id="select-label">Selección</InputLabel>
          <Select
            labelId="select-label"
            name="campo2"
            value={formData.campo2}
            onChange={handleInputChange}
          >
            <MenuItem value="opcionA">Opción A</MenuItem>
            <MenuItem value="opcionB">Opción B</MenuItem>
          </Select>
        </FormControl>

        {/* --- FIN DE TUS INPUTS --- */}

        <Button
          type="button"
          variant="contained"
          color="primary"
          fullWidth
          onClick={sendForm}
          disabled={isLoading}
          sx={{ py: 2, mt: 1 }}
        >
          {isLoading ? "Cargando..." : "Guardar"}
        </Button>
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
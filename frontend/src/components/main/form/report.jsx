import React, { useState, forwardRef, useEffect } from "react";
import {Box,Button,TextField,FormControl,InputLabel,Select,MenuItem,} from "@mui/material";
import LoadingModal from "@/hooks/Modals/LoadingModal"; 
// import axios from "axios"; // Descomentar si vas a usar axios directamente

const Reportform = forwardRef(({ onSuccess, onClose, initialData }, ref) => {
  // --- ESTADOS ---
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Campos esperados por el backend
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
  const [machines, setMachines] = useState([]);

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
    // 1. Validaciones básicas: todos los campos obligatorios
    const required = [
      "caso",
      "id_maquina",
      "area",
      "estado",
      "descripcion",
      "nombre_natural",
      "clave_natural",
      "clave_win",
      "fecha",
    ];

    for (const key of required) {
      if (!formData[key] && formData[key] !== 0) {
        setModalState({ isOpen: true, status: "error", message: "Complete todos los campos obligatorios." });
        return;
      }
    }

    // Tipos básicos
    const idMaquinaNum = Number(formData.id_maquina);
    if (isNaN(idMaquinaNum)) {
      setModalState({ isOpen: true, status: "error", message: "El campo 'id_maquina' debe ser un número." });
      return;
    }

    if (isNaN(Date.parse(formData.fecha))) {
      setModalState({ isOpen: true, status: "error", message: "Fecha inválida." });
      return;
    }

    setIsLoading(true);
    setModalState({
      isOpen: true,
      status: "loading",
      message: "Procesando solicitud...",
    });

    try {
      // 2. Llamada al endpoint del backend
      // Enviamos `nro_maquina` directamente con el valor que el usuario escribe
      const nroMaquinaVal = Number(formData.id_maquina);

      const payload = {
        caso: String(formData.caso),
        nro_maquina: Number(nroMaquinaVal),
        area: String(formData.area),
        estado: String(formData.estado),
        descripcion: String(formData.descripcion),
        nombre_natural: String(formData.nombre_natural),
        clave_natural: String(formData.clave_natural),
        clave_win: String(formData.clave_win),
        fecha: String(formData.fecha),
      };

      // Preparar headers, incluir token si existe
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const res = await fetch(`${base}/api/report`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("API error:", res.status, result);
        setFormSubmitted(false);
        setModalState({ isOpen: true, status: "error", message: result?.message || `Error del servidor: ${res.status}` });
        return;
      }

      // 3. Éxito
      setFormSubmitted(true);
      setModalState({ isOpen: true, status: "success", message: result?.message || "Operación realizada correctamente" });

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

  // Obtener lista de máquinas para que el usuario seleccione una existente
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${base}/api/machines`, { headers });
        if (!res.ok) return;
        const data = await res.json();
        setMachines(data || []);
      } catch (e) {
        console.error('Error fetching machines', e);
      }
    };
    fetchMachines();
  }, []);

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
          gap: 2,
          p: 1,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField fullWidth label="Caso" name="caso" variant="filled" value={formData.caso} onChange={handleInputChange} required />

          <TextField fullWidth label="Numero de la Máquina" name="id_maquina" type="number" variant="filled" value={formData.id_maquina} onChange={handleInputChange} required />

          <TextField fullWidth label="Área" name="area" variant="filled" value={formData.area} onChange={handleInputChange} required />

          <FormControl variant="filled" fullWidth>
            <InputLabel id="estado-label">Estado</InputLabel>
            <Select labelId="estado-label" name="estado" value={formData.estado} onChange={handleInputChange}>
              <MenuItem value="resuelto">Resuelto</MenuItem>
              <MenuItem value="en revision">En revisión</MenuItem>
              <MenuItem value="en espera">En espera</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField fullWidth label="Descripción" name="descripcion" variant="filled" multiline minRows={3} value={formData.descripcion} onChange={handleInputChange} required />

          <TextField fullWidth label="Nombre natural" name="nombre_natural" variant="filled" value={formData.nombre_natural} onChange={handleInputChange} required />

          <TextField fullWidth label="Clave natural" name="clave_natural" variant="filled" value={formData.clave_natural} onChange={handleInputChange} required />

          <TextField fullWidth label="Clave Windows" name="clave_win" variant="filled" value={formData.clave_win} onChange={handleInputChange} required />

          <TextField fullWidth label="Fecha" name="fecha" type="date" variant="filled" value={formData.fecha} onChange={handleInputChange} InputLabelProps={{ shrink: true }} required />

          <Button type="button" variant="contained" color="primary" fullWidth onClick={sendForm} disabled={isLoading} sx={{ py: 2, mt: 1 }}>
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

export default Reportform ;
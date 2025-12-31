import React, { useState, forwardRef, useEffect } from "react";
import {Box,Button,TextField,FormControl,InputLabel,Select,MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Typography,} from "@mui/material";
import LoadingModal from "@/hooks/Modals/LoadingModal"; 
import Techreport from "./techreport"; 
// import axios from "axios"; // Descomentar si vas a usar axios directamente

const Reportform = forwardRef(({ onSuccess, onClose, initialData, isEdit = false, readOnlyDefault = false, darkMode = false }, ref) => {
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

  const [isReadOnly, setIsReadOnly] = useState(Boolean(readOnlyDefault));

  useEffect(() => {
    // Cuando cambian las props iniciales, sincronizamos y mapeamos nombres de campo entre backend y frontend
    if (initialData) {
      setFormData({
        ...initialData,
        // El backend guarda la clave como 'clave_acceso_windows' en el modelo
        clave_win: initialData.clave_win ?? initialData.clave_acceso_windows ?? "",
        // Asegurar id_maquina esté en el campo que usa el formulario
        id_maquina: initialData.id_maquina ?? initialData.nro_maquina ?? "",
      });
    } else {
      setFormData(initialFormData);
    }
    setIsReadOnly(Boolean(readOnlyDefault));
  }, [initialData, readOnlyDefault]);

  // Estados para flow de reporte técnico
  const [showTechPrompt, setShowTechPrompt] = useState(false);
  const [showTechDialog, setShowTechDialog] = useState(false);
  const [createdReport, setCreatedReport] = useState(null);
  const [techInitialData, setTechInitialData] = useState(null);

  // Estado del Modal de Feedback
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: "loading", // 'loading' | 'success' | 'error'
    message: "",
  });

  // Decodificar token JWT sin verificar para obtener id de usuario
  const decodeToken = (token) => {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      // atob + decodeURIComponent to correctly handle UTF-8
      const json = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  };

  const handleContinueToTech = () => {
    const token = localStorage.getItem('token');
    const decoded = decodeToken(token);
    const id_user = decoded?.id;
    const id_report = createdReport?.id;
    setTechInitialData({ id_user: id_user ?? "", id_report: id_report ?? "" });
    setShowTechPrompt(false);
    setShowTechDialog(true);
  };

  const handleTechSuccess = () => {
    setShowTechDialog(false);
    setShowTechPrompt(false);
    clearForm();
    setFormSubmitted(true);
    onSuccess?.();
    onClose?.();
    setModalState({ isOpen: true, status: "success", message: "Reporte técnico creado correctamente." });
  };

  const handleTechClose = () => setShowTechDialog(false);

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

      // Si estamos en modo edición (isEdit) y tenemos id en initialData, llamamos PUT
      if (isEdit && initialData?.id) {
        const id = initialData.id;

        // Para update enviamos id_maquina en lugar de nro_maquina (el controlador espera id_maquina)
        const updatePayload = {
          caso: String(formData.caso),
          id_maquina: Number(nroMaquinaVal),
          area: String(formData.area),
          estado: String(formData.estado),
          descripcion: String(formData.descripcion),
          nombre_natural: String(formData.nombre_natural),
          clave_natural: String(formData.clave_natural),
          clave_win: String(formData.clave_win),
          fecha: String(formData.fecha),
        };

        console.log('Reportform - PUT', `${base}/api/report/${id}`, { headers, updatePayload });

        const res = await fetch(`${base}/api/report/${id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(updatePayload),
        });

        let result = null;
        try { result = await res.json(); } catch (e) { result = null; }

        if (!res.ok) {
          console.error("API error (update):", res.status, result);
          setFormSubmitted(false);
          setModalState({ isOpen: true, status: "error", message: result?.message || `Error del servidor: ${res.status}` });
          setIsLoading(false);
          return;
        }

        // Después de actualizar, si estado cambió a resuelto y necesita crear reporte técnico
        if (formData.estado === 'resuelto') {
          setCreatedReport(result?.report || null);
          setModalState({ isOpen: true, status: "success", message: (result?.message || "Reporte actualizado correctamente") + ". Ahora debes crear un reporte de caso." });
          setShowTechPrompt(true);
        } else {
          setFormSubmitted(true);
          setModalState({ isOpen: true, status: "success", message: result?.message || "Reporte actualizado correctamente" });
          // Notificar al padre y cerrar si corresponde
          onSuccess?.();
        }

        setIsLoading(false);
        return;
      }

      // Si no es edición, creamos nuevo
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
      if (formData.estado === 'resuelto') {
        // Mantener el formulario abierto y pedir crear reporte técnico
        setFormSubmitted(false);
        setCreatedReport(result?.report || null);
        setModalState({ isOpen: true, status: "success", message: (result?.message || "Operación realizada correctamente") + ". Ahora debes crear un reporte de caso." });
        setShowTechPrompt(true);
      } else {
        setFormSubmitted(true);
        setModalState({ isOpen: true, status: "success", message: result?.message || "Operación realizada correctamente" });
      }

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
        className={darkMode ? 'bg-transparent text-gray-100' : ''}
        sx={{
          display: "flex",
          gap: 2,
          p: 1,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField disabled={isReadOnly} fullWidth label="Caso" name="caso" variant="filled" value={formData.caso} onChange={handleInputChange} required />

          <TextField disabled={isReadOnly} fullWidth label="Numero de la Máquina" name="id_maquina" type="number" variant="filled" value={formData.id_maquina} onChange={handleInputChange} required />

          <TextField disabled={isReadOnly} fullWidth label="Área" name="area" variant="filled" value={formData.area} onChange={handleInputChange} required />

          <FormControl variant="filled" fullWidth>
            <InputLabel id="estado-label">Estado</InputLabel>
            <Select disabled={isReadOnly} labelId="estado-label" name="estado" value={formData.estado} onChange={handleInputChange}>
              <MenuItem value="resuelto">Resuelto</MenuItem>
              <MenuItem value="en revision">En revisión</MenuItem>
              <MenuItem value="en espera">En espera</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField disabled={isReadOnly} fullWidth label="Descripción" name="descripcion" variant="filled" multiline minRows={3} value={formData.descripcion} onChange={handleInputChange} required />

          <TextField disabled={isReadOnly} fullWidth label="Nombre natural" name="nombre_natural" variant="filled" value={formData.nombre_natural} onChange={handleInputChange} required />

          <TextField disabled={isReadOnly} fullWidth label="Clave natural" name="clave_natural" variant="filled" value={formData.clave_natural} onChange={handleInputChange} required />

          <TextField disabled={isReadOnly} fullWidth label="Clave Windows" name="clave_win" variant="filled" value={formData.clave_win} onChange={handleInputChange} required />

          <TextField disabled={isReadOnly} fullWidth label="Fecha" name="fecha" type="date" variant="filled" value={formData.fecha} onChange={handleInputChange} InputLabelProps={{ shrink: true }} required />

          <Button type="button" variant="contained" color="primary" fullWidth onClick={sendForm} disabled={isLoading || isReadOnly} sx={{ py: 2, mt: 1 }}>
            {isLoading ? "Cargando..." : (isEdit ? "Guardar cambios" : "Guardar")}
          </Button>
        </Box>
      </Box>

      {/* Dialog para indicar que hay que crear reporte técnico ahora */}
      <Dialog open={showTechPrompt} onClose={() => setShowTechPrompt(false)}>
        <DialogTitle>Crear reporte técnico</DialogTitle>
        <DialogContent>
          <Typography>El reporte fue guardado con estado "resuelto". Debes crear ahora un reporte de caso técnico para este reporte.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTechPrompt(false)}>Cancelar</Button>
          <Button onClick={handleContinueToTech} variant="contained">Continuar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog con el formulario de Reporte Técnico */}
      <Dialog open={showTechDialog} onClose={handleTechClose} maxWidth="md" fullWidth>
        <DialogTitle>Registrar reporte técnico</DialogTitle>
        <DialogContent>
          <Techreport initialData={techInitialData} onSuccess={handleTechSuccess} onClose={handleTechClose} />
        </DialogContent>
      </Dialog>

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
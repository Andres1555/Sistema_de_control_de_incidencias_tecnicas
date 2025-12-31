import React, { useEffect, useState } from "react";
import axios from "axios";
import ReportTechCard from "./reportechcard";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import Techreport from "../form/techreport";

const ReportTechList = ({ userId, darkMode = true }) => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dialog state
  const [selectedCase, setSelectedCase] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogReadOnly, setDialogReadOnly] = useState(true);
  const [dialogIsEdit, setDialogIsEdit] = useState(false);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/report_cases/user/${userId}`);
      setCases(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching report cases:", err);
      setError("No se pudieron cargar los casos técnicos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setError("Se requiere userId para obtener los casos técnicos");
      setLoading(false);
      return;
    }

    let mounted = true;
    fetchCases();
    return () => (mounted = false);
  }, [userId]);

  const handleView = (report) => {
    setSelectedCase(report);
    setDialogReadOnly(true);
    setDialogIsEdit(false);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCase(null);
  };

  const handleToggleEdit = () => {
    setDialogReadOnly(false);
    setDialogIsEdit(true);
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("¿Eliminar este caso técnico?");
    if (!confirm) return;
    try {
      await axios.delete(`http://localhost:8080/api/report_cases/${id}`);
      fetchCases();
    } catch (err) {
      console.error('Error deleting report case', err);
      alert('No se pudo eliminar el caso técnico');
    }
  };

  if (loading) return <div className="p-6 text-center">Cargando casos técnicos...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!cases.length) return <div className="p-6 text-center text-gray-600">No hay casos técnicos para mostrar</div>;

  return (
    <>
      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-4">
        {cases.map((c) => (
          <ReportTechCard key={c.id} report={c} onView={handleView} onDelete={handleDelete} darkMode={darkMode} />
        ))}
      </section>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ style: { backgroundColor: darkMode ? '#1f2937' : '#ffffff', color: darkMode ? '#ffffff' : '#000000' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {selectedCase ? (selectedCase.caso_tecnico || `Caso #${selectedCase.id}`) : 'Detalle del caso técnico'}
          <div>
            {dialogReadOnly && (
              <Tooltip title="Editar">
                <IconButton onClick={handleToggleEdit} size="small">
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={handleCloseDialog} size="small"><CloseIcon /></IconButton>
          </div>
        </DialogTitle>
        <DialogContent sx={{ borderColor: darkMode ? '#374151' : undefined }}>
          {selectedCase && (
            <Techreport initialData={selectedCase} isEdit={dialogIsEdit} readOnlyDefault={dialogReadOnly} darkMode={darkMode} onSuccess={() => { fetchCases(); handleCloseDialog(); }} onClose={handleCloseDialog} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportTechList;

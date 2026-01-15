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
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // Iconos consistentes
import Techreport from "../form/techreport";

const ReportTechList = ({ userId, darkMode = true }) => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ESTADOS DE PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 12;

  const [selectedCase, setSelectedCase] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogReadOnly, setDialogReadOnly] = useState(true);
  const [dialogIsEdit, setDialogIsEdit] = useState(false);

  const fetchCases = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/report_cases/user/${userId}?page=${page}&limit=${limit}`);
      
      if (res.data && res.data.data) {
        setCases(res.data.data);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.currentPage || 1);
        setTotalItems(res.data.totalItems || 0);
      } else {
        setCases(Array.isArray(res.data) ? res.data : []);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching report cases:", err);
      setError("No se pudieron cargar los casos técnicos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchCases(currentPage);
  }, [userId, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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

  return (
    <div className="flex flex-col h-full min-h-screen">
      {error && <div className="p-6 text-center text-red-600 font-bold">{error}</div>}

      {loading && cases.length === 0 ? (
        <div className="p-6 text-center animate-pulse text-blue-500 font-bold tracking-widest uppercase">Cargando...</div>
      ) : (
        <>
          <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-4">
            {cases.map((c) => (
              <ReportTechCard key={c.id} report={c} onView={handleView} darkMode={darkMode} />
            ))}
          </section>

          {/* --- PAGINACIÓN ESTILO USERLIST/WORKERLIST --- */}
          <div className="flex flex-col items-center justify-center gap-4 py-10 mt-auto">
            <div className="flex items-center gap-3">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => handlePageChange(currentPage - 1)}
                className={`p-2.5 rounded-xl border transition-all ${
                  darkMode 
                  ? "bg-slate-800 border-slate-700 text-white disabled:opacity-20 hover:bg-slate-700" 
                  : "bg-white border-slate-200 text-slate-700 disabled:opacity-30 hover:bg-slate-50 shadow-sm"
                }`}
              >
                <FaChevronLeft size={14} />
              </button>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${darkMode ? "bg-slate-800/50" : "bg-gray-100"}`}>
                <span className={`text-sm font-black ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Página 
                  <span className={`mx-2 px-3 py-1 rounded-lg ${darkMode ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}>
                    {currentPage}
                  </span> 
                  de {totalPages}
                </span>
              </div>

              <button
                disabled={currentPage === totalPages || loading}
                onClick={() => handlePageChange(currentPage + 1)}
                className={`p-2.5 rounded-xl border transition-all ${
                  darkMode 
                  ? "bg-slate-800 border-slate-700 text-white disabled:opacity-20 hover:bg-slate-700" 
                  : "bg-white border-slate-200 text-slate-700 disabled:opacity-30 hover:bg-slate-50 shadow-sm"
                }`}
              >
                <FaChevronRight size={14} />
              </button>
            </div>
            
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-50 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Total: {totalItems} registros
            </p>
          </div>
        </>
      )}

      {/* --- MODAL DE DETALLE (Igual a la imagen) --- */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth 
        PaperProps={{ 
          style: { 
            backgroundColor: darkMode ? '#1e293b' : '#ffffff', 
            color: darkMode ? '#ffffff' : '#000000',
            borderRadius: '24px', // Bordes redondeados como en la imagen
            backgroundImage: 'none'
          } 
        }}
      >
        <DialogTitle className="flex items-center justify-between p-6">
          <span className="font-black text-sm uppercase tracking-widest opacity-70">
            {selectedCase ? (selectedCase.caso_tecnico || `Caso #${selectedCase.id}`) : 'Detalle'}
          </span>
          <div className="flex items-center gap-1">
            <IconButton onClick={handleCloseDialog} sx={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
              <CloseIcon size={20} />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: darkMode ? '#334155' : '#f1f5f9', p: 0 }}>
          {selectedCase && (
            <Techreport 
              initialData={selectedCase} 
              isEdit={dialogIsEdit} 
              readOnlyDefault={dialogReadOnly} 
              darkMode={darkMode} 
              onSuccess={() => { fetchCases(currentPage); handleCloseDialog(); }} 
              onClose={handleCloseDialog} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportTechList;
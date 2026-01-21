import React, { useEffect, useState } from "react";
import axios from "axios";
import ReportTechCard from "./reportechcard";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Techreport from "../form/techreport";

const ReportTechList = ({ userId, darkMode = true, searchTerm = "", refreshKey = 0 }) => {
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

  const fetchCases = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      let url = "";

      // --- LÓGICA DE RUTAS ---
      if (searchTerm) {
        // Búsqueda global por nombre/apellido del técnico
        url = `http://localhost:8080/api/report_cases/search?caso=${encodeURIComponent(searchTerm)}`;
      } else if (userId) {
        // Listado específico del técnico logueado (paginado)
        url = `http://localhost:8080/api/report_cases/user/${userId}?page=${page}&limit=${limit}`;
      } else {
        // Listado general (si no hay userId, ej. para Admin)
        url = `http://localhost:8080/api/report_cases?page=${page}&limit=${limit}`;
      }

      console.log("Petición enviada a:", url);
      const res = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (searchTerm) {
        // Cuando buscamos, el backend suele devolver el array directo
        const searchData = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setCases(searchData);
        setTotalPages(1);
        setTotalItems(searchData.length);
      } else {
        // Cuando paginamos, usamos la estructura de objeto
        const responseData = res.data.data || (Array.isArray(res.data) ? res.data : []);
        setCases(responseData);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.currentPage || page);
        setTotalItems(res.data.totalItems || responseData.length);
      }
    } catch (err) {
      console.error("Error al cargar casos:", err);
      if (err.response?.status === 404 && searchTerm) {
        setCases([]);
      } else {
        setError("Error al conectar con el servidor técnico");
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCases(searchTerm ? 1 : currentPage);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, refreshKey, currentPage, userId]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleView = (report) => {
    setSelectedCase(report);
    setDialogReadOnly(true);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCase(null);
  };

  if (loading && cases.length === 0) {
    return <div className="p-20 text-center text-blue-500 animate-pulse font-black uppercase tracking-widest">Buscando registros técnicos...</div>;
  }

  return (
    <div className="w-full flex flex-col transition-all duration-300">
      {error && <div className="p-4 mx-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-xl text-center font-bold mb-4">{error}</div>}

      {!loading && cases.length === 0 ? (
        <div className="p-20 text-center text-slate-500 italic border-2 border-dashed border-slate-700 rounded-3xl m-4">
          No se encontraron resoluciones técnicas para "{searchTerm}"
        </div>
      ) : (
        /* --- GRILLA FULL WIDTH --- */
        <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 p-4 w-full">
          {cases.map((c) => (
            <ReportTechCard 
              key={c.id} 
              report={c} 
              onView={handleView} 
              darkMode={darkMode} 
              // Refrescamos la lista si se elimina algo
              onDelete={() => fetchCases(currentPage)} 
            />
          ))}
        </section>
      )}

      {/* --- PAGINACIÓN SÓLIDA (Oculta en búsqueda) --- */}
      {!searchTerm && totalPages > 1 && (
        <div className="flex flex-col items-center justify-center gap-4 py-10 mt-auto">
          <div className="flex items-center gap-3">
            <button
              disabled={currentPage === 1 || loading}
              onClick={() => handlePageChange(currentPage - 1)}
              className={`p-3 rounded-xl border transition-all ${
                darkMode 
                ? "bg-slate-800 border-slate-700 text-white disabled:opacity-20 hover:bg-slate-700" 
                : "bg-white border-slate-200 text-slate-700 disabled:opacity-30 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <FaChevronLeft size={14} />
            </button>

            <div className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl ${darkMode ? "bg-slate-800/50" : "bg-gray-100"}`}>
              <span className={`text-sm font-black uppercase ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                Página <span className="text-blue-500 mx-1">{currentPage}</span> de {totalPages}
              </span>
            </div>

            <button
              disabled={currentPage === totalPages || loading}
              onClick={() => handlePageChange(currentPage + 1)}
              className={`p-3 rounded-xl border transition-all ${
                darkMode 
                ? "bg-slate-800 border-slate-700 text-white disabled:opacity-20 hover:bg-slate-700" 
                : "bg-white border-slate-200 text-slate-700 disabled:opacity-30 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <FaChevronRight size={14} />
            </button>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
            Total: {totalItems} resoluciones técnicas
          </p>
        </div>
      )}

      {/* --- MODAL DE DETALLE --- */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth 
        PaperProps={{ 
          style: { 
            backgroundColor: darkMode ? '#1e293b' : '#ffffff', 
            color: darkMode ? '#ffffff' : '#000000',
            borderRadius: '24px',
            backgroundImage: 'none'
          } 
        }}
      >
        <DialogTitle className="flex items-center justify-between p-6">
          <span className="font-black text-xs uppercase tracking-widest opacity-60">Detalle de Caso Técnico</span>
          <IconButton onClick={handleCloseDialog} sx={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: darkMode ? '#334155' : '#f1f5f9', p: 3 }}>
          {selectedCase && (
            <Techreport 
              initialData={selectedCase} 
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
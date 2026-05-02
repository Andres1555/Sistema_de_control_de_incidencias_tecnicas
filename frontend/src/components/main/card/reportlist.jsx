import React, { useEffect, useState } from "react";
import axios from "axios";
import ReportCard from "./reportcard";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; 
import Reportform from "../form/report";

const ReportList = ({ darkMode = true, searchTerm = "", refreshKey = 0, filter = {} }) => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0); 
    const limit = 9; 

    const [selectedReport, setSelectedReport] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogReadOnly, setDialogReadOnly] = useState(true);
    const [dialogIsEdit, setDialogIsEdit] = useState(false);

    const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);
    const [targetArea, setTargetArea] = useState("");
    const [isEscalating, setIsEscalating] = useState(false);

    const fetchReports = async (page = 1) => {
        setLoading(true);
        try {
            const hasFilter = (filter && (filter.area || filter.fecha));
            if (hasFilter) {
                const params = new URLSearchParams();
                if (filter.area) params.append('area', filter.area);
                if (filter.fecha) params.append('fecha', filter.fecha);
                const url = `${API_URL}/api/report/filter?${params.toString()}`;
                const token = localStorage.getItem('token');
                const res = await axios.get(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
                setReports(data);
                setTotalPages(1);
                setCurrentPage(1);
                setTotalItems(data.length);
            } else {
                let url = `${API_URL}/api/report?page=${page}&limit=${limit}`;
                if (searchTerm) {
                    url = `${API_URL}/api/report/search?caso=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`;
                }
                const token = localStorage.getItem('token');
                const res = await axios.get(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (res.data && res.data.data) {
                    setReports(res.data.data);
                    setTotalPages(res.data.totalPages || 1);
                    setCurrentPage(res.data.currentPage || 1);
                    setTotalItems(res.data.totalItems || 0);
                } else {
                    setReports(Array.isArray(res.data) ? res.data : []);
                }
            }
            setError(null);
        } catch (err) {
            console.error("Error fetching reports:", err);
            setError("No se pudieron cargar los reportes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filter]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchReports(currentPage);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, refreshKey, currentPage, filter]); 

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // --- CAMBIO CLAVE AQUÍ PARA ARREGLAR LA FECHA ---
    const handleView = (report) => {
        // Si la fecha viene como ISO (ej: 2026-01-30T00:00:00Z) o string con tiempo,
        // cortamos solo la parte de la fecha (YYYY-MM-DD) para evitar el desfase horario.
        let fixedDate = report.fecha;
        if (report.fecha && report.fecha.includes('T')) {
            fixedDate = report.fecha.split('T')[0];
        }

        setSelectedReport({ ...report, fecha: fixedDate });
        setDialogReadOnly(true);
        setDialogIsEdit(false);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedReport(null);
    };

    const handleToggleEdit = () => {
        setDialogReadOnly(false);
        setDialogIsEdit(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Eliminar este reporte?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/report/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchReports(currentPage);
        } catch (err) {
            console.error('Error deleting report', err);
            alert('No se pudo eliminar el reporte');
        }
    };

    const handleEscalateClick = (report) => {
        setSelectedReport(report);
        setTargetArea(report.area || "");
        setEscalateDialogOpen(true);
    };

    const confirmEscalation = async () => {
        if (!targetArea) return alert("Seleccione un área");
        setIsEscalating(true);
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/api/report/${selectedReport.id}/escalate`, 
                { area: targetArea },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setEscalateDialogOpen(false);
            fetchReports(currentPage);
        } catch (err) {
            console.error('Error escalating report', err);
            alert('Error al escalar el reporte');
        } finally {
            setIsEscalating(false);
        }
    };

    return (
        <div className="flex flex-col h-full min-h-screen">
            {error && <div className="p-4 text-center text-red-500 font-bold">{error}</div>}

            {loading && reports.length === 0 ? (
                <div className="p-10 text-center animate-pulse text-blue-500 font-bold tracking-widest uppercase">
                    Buscando reportes...
                </div>
            ) : reports.length === 0 ? (
                <div className="p-20 text-center text-gray-500 italic border-2 border-dashed border-gray-700 rounded-xl m-4">
                    No se encontraron reportes.
                </div>
            ) : (
                <>
                    <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-4">
                        {reports.map((r) => (
                            <ReportCard 
                                key={r.id} 
                                report={r} 
                                onView={handleView} 
                                onDelete={handleDelete} 
                                onEscalate={handleEscalateClick}
                                darkMode={darkMode} 
                            />
                        ))}
                    </section>

                    <div className="flex flex-col items-center justify-center gap-4 py-10 mt-auto">
                        <div className="flex items-center gap-3">
                            <button
                                disabled={currentPage === 1 || loading}
                                onClick={() => handlePageChange(currentPage - 1)}
                                className={`p-2.5 rounded-xl border transition-all ${
                                    darkMode ? "bg-slate-800 border-slate-700 text-white disabled:opacity-20 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-700 disabled:opacity-30 hover:bg-slate-50 shadow-sm"
                                }`}
                            >
                                <FaChevronLeft size={14} />
                            </button>

                            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${darkMode ? "bg-slate-800/50" : "bg-gray-100"}`}>
                                <span className={`text-sm font-black ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                                    Página <span className={`mx-2 px-3 py-1 rounded-lg ${darkMode ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}>{currentPage}</span> de {totalPages}
                                </span>
                            </div>

                            <button
                                disabled={currentPage === totalPages || loading}
                                onClick={() => handlePageChange(currentPage + 1)}
                                className={`p-2.5 rounded-xl border transition-all ${
                                    darkMode ? "bg-slate-800 border-slate-700 text-white disabled:opacity-20 hover:bg-slate-700" : "bg-white border-slate-200 text-slate-700 disabled:opacity-30 hover:bg-slate-50 shadow-sm"
                                }`}
                            >
                                <FaChevronRight size={14} />
                            </button>
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-50 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Registros totales: {totalItems}
                        </p>
                    </div>
                </>
            )}

            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="md"
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
                    <span className="font-black text-sm uppercase tracking-widest opacity-70">
                        {selectedReport ? (selectedReport.caso || `Reporte #${selectedReport.id}`) : 'Detalle'}
                    </span>
                    <div className="flex items-center gap-1">
                        {dialogReadOnly && (
                            <Tooltip title="Editar">
                                <IconButton onClick={handleToggleEdit} sx={{ color: '#3b82f6' }}>
                                    <EditIcon size={20} />
                                </IconButton>
                            </Tooltip>
                        )}
                        <IconButton onClick={handleCloseDialog} sx={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                            <CloseIcon size={22} />
                        </IconButton>
                    </div>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    {selectedReport && (
                        <Reportform 
                            key={`${selectedReport.id}-${dialogIsEdit}`} 
                            initialData={selectedReport} 
                            isEdit={dialogIsEdit} 
                            readOnlyDefault={dialogReadOnly} 
                            darkMode={darkMode} 
                            onSuccess={() => { 
                                fetchReports(currentPage); 
                                handleCloseDialog(); 
                            }} 
                            onClose={handleCloseDialog} 
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* DIALOGO DE ESCALACIÓN */}
            <Dialog 
                open={escalateDialogOpen} 
                onClose={() => !isEscalating && setEscalateDialogOpen(false)}
                PaperProps={{ 
                    style: { 
                        backgroundColor: darkMode ? '#1e293b' : '#ffffff', 
                        color: darkMode ? '#ffffff' : '#000000',
                        borderRadius: '20px',
                        padding: '10px'
                    } 
                }}
            >
                <DialogTitle className="font-black uppercase tracking-widest text-center text-blue-500">
                    Escalar Reporte
                </DialogTitle>
                <DialogContent>
                    <div className="py-4 space-y-4">
                        <p className={`text-xs font-bold uppercase opacity-70 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Seleccione el área a la que desea escalar este caso:
                        </p>
                        <select 
                            value={targetArea}
                            onChange={(e) => setTargetArea(e.target.value)}
                            className={`w-full p-3 rounded-xl border-2 font-bold outline-none transition-all ${
                                darkMode 
                                ? "bg-slate-800 border-slate-700 text-white focus:border-blue-500" 
                                : "bg-gray-50 border-gray-200 text-gray-800 focus:border-blue-500"
                            }`}
                        >
                            <option value="">-- Seleccionar Área --</option>
                            <option value="Redes">Redes</option>
                            <option value="Soporte Tecnico">Soporte Técnico</option>
                            <option value="Caue">Caue</option>
                            <option value="Desarrollo">Desarrollo</option>
                        </select>
                        
                        <div className="flex gap-3 mt-6">
                            <button 
                                onClick={() => setEscalateDialogOpen(false)}
                                disabled={isEscalating}
                                className={`flex-1 py-3 rounded-xl font-black uppercase text-xs transition-all ${
                                    darkMode ? "bg-slate-700 text-white hover:bg-slate-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={confirmEscalation}
                                disabled={isEscalating || !targetArea}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase text-xs transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50"
                            >
                                {isEscalating ? "Escalando..." : "Confirmar"}
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ReportList;
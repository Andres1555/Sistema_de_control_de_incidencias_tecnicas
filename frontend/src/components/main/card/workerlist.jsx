import React, { useEffect, useState } from "react";
import axios from "axios";
import WorkerCard from "./workercard";
import WorkerForm from "../form/workersreport"; 
import { FiX, FiEdit3 } from "react-icons/fi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // Usamos Fa para consistencia visual
import { Dialog, DialogTitle, DialogContent, IconButton, Tooltip } from '@mui/material';

const WorkerList = ({ darkMode = true, searchTerm = "", refreshKey = 0 }) => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
    });

    const [selectedWorker, setSelectedWorker] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogReadOnly, setDialogReadOnly] = useState(true);

    const fetchWorkers = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            let url = `http://localhost:8080/api/workers?page=${page}`;
            
            if (searchTerm) {
                url = `http://localhost:8080/api/workers/search?search=${encodeURIComponent(searchTerm)}`;
            }

            const res = await axios.get(url);
            
            if (searchTerm) {
                const searchData = Array.isArray(res.data) ? res.data : (res.data.workers || []);
                setWorkers(searchData);
                setPagination({ currentPage: 1, totalPages: 1, totalItems: searchData.length });
            } else {
                setWorkers(res.data.workers || []);
                setPagination({
                    currentPage: res.data.currentPage || 1,
                    totalPages: res.data.totalPages || 1,
                    totalItems: res.data.totalItems || 0
                });
            }
        } catch (err) {
            console.error("Error al cargar trabajadores:", err);
            if (err.response?.status === 404 && searchTerm) {
                setWorkers([]);
            } else {
                setError("No se pudo establecer conexión con el servidor");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchWorkers(1); 
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, refreshKey]);

    const handleView = (worker) => {
        setSelectedWorker(worker);
        setDialogReadOnly(true); 
        setDialogOpen(true);
    };

    const handleDelete = async (id) => {
        const confirm = window.confirm("¿Estás seguro de eliminar a este trabajador?");
        if (!confirm) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/workers/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchWorkers(pagination.currentPage);
        } catch (err) {
            console.error("Error al eliminar:", err);
            alert(err.response?.data?.message || "Error al eliminar");
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchWorkers(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (loading && workers.length === 0) {
        return <div className="p-20 text-center text-blue-500 animate-pulse font-bold tracking-widest uppercase">Cargando trabajadores...</div>;
    }

    return (
        <div className="flex flex-col h-full min-h-screen">
            {error && (
                <div className="m-4 bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg text-center font-bold">
                    {error}
                </div>
            )}

            {!loading && workers.length === 0 ? (
                <div className="p-20 text-center text-gray-500 italic">
                    No se encontraron trabajadores que coincidan con "{searchTerm}"
                </div>
            ) : (
                <>
                    <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
                        {workers.map((w) => (
                            <WorkerCard 
                                key={w.id} 
                                worker={w} 
                                onView={handleView} 
                                onDelete={handleDelete} 
                                darkMode={darkMode} 
                            />
                        ))}
                    </section>

                    {/* --- CONTROLES DE PAGINACIÓN ESTILO USERLIST --- */}
                    <div className="flex flex-col items-center justify-center gap-4 py-10 mt-auto">
                        <div className="flex items-center gap-3">
                            <button
                                disabled={pagination.currentPage === 1 || loading}
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
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
                                        {pagination.currentPage}
                                    </span> 
                                    de {pagination.totalPages}
                                </span>
                            </div>

                            <button
                                disabled={pagination.currentPage === pagination.totalPages || loading}
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
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
                            Registros totales: {pagination.totalItems}
                        </p>
                    </div>
                </>
            )}

            {/* MODAL DE DETALLE / EDICIÓN */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
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
                    <span className="font-black text-sm uppercase tracking-widest opacity-70">Perfil del Trabajador</span>
                    <div className="flex items-center gap-1">
                        {dialogReadOnly && (
                            <Tooltip title="Editar Datos">
                                <IconButton onClick={() => setDialogReadOnly(false)} sx={{ color: '#3b82f6' }}>
                                    <FiEdit3 size={18} />
                                </IconButton>
                            </Tooltip>
                        )}
                        <IconButton onClick={() => setDialogOpen(false)} sx={{ color: darkMode ? '#94a3b8' : '#64748b' }}>
                            <FiX size={20} />
                        </IconButton>
                    </div>
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    {selectedWorker && (
                        <WorkerForm 
                            initialData={selectedWorker} 
                            readOnlyDefault={dialogReadOnly} 
                            darkMode={darkMode} 
                            onSuccess={() => { fetchWorkers(pagination.currentPage); setDialogOpen(false); }} 
                            onClose={() => setDialogOpen(false)} 
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default WorkerList;
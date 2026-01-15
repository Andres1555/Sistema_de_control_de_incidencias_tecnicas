import React, { useEffect, useState } from "react";
import axios from "axios";
import UserCard from "./userscard"; 
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import UserForm from "../form/usersform";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa"; // Cambiado a Fa para consistencia visual

const UserList = ({ darkMode = true, searchTerm = "", refreshKey = 0 }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
    });

    const [selectedUser, setSelectedUser] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogReadOnly, setDialogReadOnly] = useState(true);
    const [dialogIsEdit, setDialogIsEdit] = useState(false);

    const fetchUsers = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            let url = `http://localhost:8080/api/users?page=${page}`;
            
            if (searchTerm) {
                url = `http://localhost:8080/api/users/search?search=${encodeURIComponent(searchTerm)}`;
            }

            const res = await axios.get(url);
            
            if (searchTerm) {
                const searchData = Array.isArray(res.data) ? res.data : (res.data.users || []);
                setUsers(searchData);
                setPagination({ currentPage: 1, totalPages: 1, totalItems: searchData.length });
            } else {
                setUsers(res.data.users || []);
                setPagination({
                    currentPage: res.data.currentPage || 1,
                    totalPages: res.data.totalPages || 1,
                    totalItems: res.data.totalItems || 0
                });
            }
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("No se pudieron cargar los usuarios del sistema");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, refreshKey]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchUsers(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleView = (user) => {
        setSelectedUser(user);
        setDialogReadOnly(true);
        setDialogIsEdit(false);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedUser(null);
    };

    const handleToggleEdit = () => {
        setDialogReadOnly(false);
        setDialogIsEdit(true);
    };

    const handleDelete = async (id) => {
        const confirm = window.confirm("¿Estás seguro de eliminar este usuario?");
        if (!confirm) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/users/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchUsers(pagination.currentPage);
        } catch (err) {
            alert(err?.response?.data?.message || 'No se pudo eliminar el usuario');
        }
    };

    return (
        <div className="flex flex-col h-full min-h-screen">
            {error && <div className="p-4 text-center text-red-600 font-bold">{error}</div>}

            {loading && users.length === 0 ? (
                <div className="p-10 text-center animate-pulse text-blue-500 font-bold tracking-widest uppercase">
                    Cargando Usuarios...
                </div>
            ) : users.length === 0 ? (
                <div className="p-20 text-center text-gray-500 italic border-2 border-dashed border-gray-700 rounded-xl m-4">
                    No se encontraron usuarios que coincidan con "{searchTerm}"
                </div>
            ) : (
                <>
                    <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-4">
                        {users.map((u) => (
                            <UserCard 
                                key={u.id} 
                                user={u} 
                                onView={handleView} 
                                onDelete={handleDelete} 
                                darkMode={darkMode} 
                            />
                        ))}
                    </section>

                    {/* --- CONTROLES DE PAGINACIÓN UNIFICADOS --- */}
                    {!searchTerm && (
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
                                Total: {pagination.totalItems} usuarios registrados
                            </p>
                        </div>
                    )}
                </>
            )}

            {/* Modal de Detalle / Edición */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                PaperProps={{ 
                    style: { 
                        backgroundColor: darkMode ? '#1e293b' : '#ffffff', 
                        color: darkMode ? '#ffffff' : '#000000',
                        borderRadius: '24px', // Bordes redondeados consistentes
                        backgroundImage: 'none'
                    } 
                }}
            >
                <DialogTitle className="flex items-center justify-between p-6">
                    <span className="font-black text-sm uppercase tracking-widest opacity-70">
                        {selectedUser ? `${selectedUser.nombre} ${selectedUser.apellido}` : 'Perfil de Usuario'}
                    </span>
                    <div className="flex items-center gap-1">
                        {dialogReadOnly && (
                            <Tooltip title="Editar Usuario">
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
                    {selectedUser && (
                        <UserForm 
                            initialData={selectedUser} 
                            isEdit={dialogIsEdit} 
                            readOnlyDefault={dialogReadOnly} 
                            darkMode={darkMode} 
                            onSuccess={() => { fetchUsers(pagination.currentPage); handleCloseDialog(); }} 
                            onClose={handleCloseDialog} 
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserList;
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
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"; // Iconos para paginación

const UserList = ({ darkMode = true, searchTerm = "", refreshKey = 0 }) => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// --- ESTADOS DE PAGINACIÓN ---
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0
	});

	// Estados para el Modal (Ver / Editar)
	const [selectedUser, setSelectedUser] = useState(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogReadOnly, setDialogReadOnly] = useState(true);
	const [dialogIsEdit, setDialogIsEdit] = useState(false);

	// 1. Cargar usuarios (soporta búsqueda y carga normal paginada)
	const fetchUsers = async (page = 1) => {
		setLoading(true);
		setError(null);
		try {
			let url = `http://localhost:8080/api/users?page=${page}`;
			
			if (searchTerm) {
				// El endpoint de búsqueda suele devolver la lista completa filtrada
				url = `http://localhost:8080/api/users/search?search=${encodeURIComponent(searchTerm)}`;
			}

			const res = await axios.get(url);
			
			// Si es búsqueda, res.data es el array directo. Si es paginado, viene en res.data.users
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

	// 2. useEffect para reaccionar al buscador, al refreshKey y cambios de página
	useEffect(() => {
		const timer = setTimeout(() => {
			fetchUsers(1); // Al buscar o refrescar, volvemos a la página 1
		}, 300);

		return () => clearTimeout(timer);
	}, [searchTerm, refreshKey]);

	const handlePageChange = (newPage) => {
		if (newPage >= 1 && newPage <= pagination.totalPages) {
			fetchUsers(newPage);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	// Manejo de Visualización
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

	if (loading && users.length === 0) return <div className="p-10 text-center animate-pulse text-blue-500 font-bold">CARGANDO USUARIOS...</div>;

	return (
		<div className="space-y-10">
			{error && <div className="p-4 text-center text-red-600 font-bold">{error}</div>}

			{/* Mensaje cuando no hay resultados */}
			{!loading && users.length === 0 ? (
				<div className="p-20 text-center text-gray-500 italic border-2 border-dashed border-gray-700 rounded-xl m-4">
					No se encontraron usuarios que coincidan con "{searchTerm}"
				</div>
			) : (
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
			)}

			{/* --- CONTROLES DE PAGINACIÓN --- */}
			{!searchTerm && pagination.totalPages > 1 && (
				<div className="flex flex-col items-center justify-center gap-4 py-8 border-t border-gray-700/20">
					<div className="flex items-center gap-4">
						<button
							disabled={pagination.currentPage === 1}
							onClick={() => handlePageChange(pagination.currentPage - 1)}
							className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition-all ${
								darkMode ? "border-gray-700 hover:bg-gray-800 text-gray-300 disabled:opacity-20" : "border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-30"
							}`}
						>
							<FiChevronLeft /> Anterior
						</button>

						<div className="flex items-center gap-2">
							{[...Array(pagination.totalPages)].map((_, index) => {
								const pageNumber = index + 1;
								// Mostrar solo páginas cercanas a la actual
								if (pageNumber === 1 || pageNumber === pagination.totalPages || (pageNumber >= pagination.currentPage - 1 && pageNumber <= pagination.currentPage + 1)) {
									return (
										<button
											key={pageNumber}
											onClick={() => handlePageChange(pageNumber)}
											className={`w-10 h-10 rounded-lg font-bold transition-all ${
												pagination.currentPage === pageNumber 
													? "bg-blue-600 text-white shadow-lg scale-110" 
													: darkMode ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"
											}`}
										>
											{pageNumber}
										</button>
									);
								}
								return null;
							})}
						</div>

						<button
							disabled={pagination.currentPage === pagination.totalPages}
							onClick={() => handlePageChange(pagination.currentPage + 1)}
							className={`flex items-center gap-1 px-4 py-2 rounded-lg border transition-all ${
								darkMode ? "border-gray-700 hover:bg-gray-800 text-gray-300 disabled:opacity-20" : "border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-30"
							}`}
						>
							Siguiente <FiChevronRight />
						</button>
					</div>
					<p className={`text-sm font-semibold ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
						Total: {pagination.totalItems} usuarios registrados
					</p>
				</div>
			)}

			{/* Modal de Detalle / Edición */}
			<Dialog
				open={dialogOpen}
				onClose={handleCloseDialog}
				maxWidth="md"
				fullWidth
				PaperProps={{ 
					style: { 
						backgroundColor: darkMode ? '#1f2937' : '#ffffff', 
						color: darkMode ? '#ffffff' : '#000000',
						borderRadius: '12px'
					} 
				}}
			>
				<DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: darkMode ? '1px solid #374151' : '1px solid #eee' }}>
					<span className="font-bold uppercase tracking-tight">
						{selectedUser ? `${selectedUser.nombre} ${selectedUser.apellido}` : 'Perfil de Usuario'}
					</span>
					<div>
						{dialogReadOnly && (
							<Tooltip title="Editar Usuario">
								<IconButton onClick={handleToggleEdit} size="small" sx={{ mr: 1, color: darkMode ? '#60a5fa' : '#2563eb' }}>
									<EditIcon />
								</IconButton>
							</Tooltip>
						)}
						<IconButton onClick={handleCloseDialog} size="small" sx={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
							<CloseIcon />
						</IconButton>
					</div>
				</DialogTitle>

				<DialogContent sx={{ mt: 2 }}>
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
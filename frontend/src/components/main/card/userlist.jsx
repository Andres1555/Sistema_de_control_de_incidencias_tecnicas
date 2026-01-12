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

// Agregamos searchTerm y refreshKey a las props
const UserList = ({ darkMode = true, searchTerm = "", refreshKey = 0 }) => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Estados para el Modal (Ver / Editar)
	const [selectedUser, setSelectedUser] = useState(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogReadOnly, setDialogReadOnly] = useState(true);
	const [dialogIsEdit, setDialogIsEdit] = useState(false);

	// 1. Cargar usuarios (soporta búsqueda y carga normal)
	const fetchUsers = async () => {
		setLoading(true);
		setError(null);
		try {
			// Construcción de URL dinámica
			let url = "http://localhost:8080/api/users";
			
			if (searchTerm) {
				// Cambiamos al endpoint de búsqueda configurado en el backend
				url = `http://localhost:8080/api/users/search?search=${encodeURIComponent(searchTerm)}`;
			}

			console.log("Pidiendo usuarios a:", url);
			const res = await axios.get(url);
			
			// Manejamos la respuesta: si es búsqueda suele ser array, si es lista puede venir envuelto
			const data = Array.isArray(res.data) ? res.data : (res.data.users || []);
			setUsers(data);
		} catch (err) {
			console.error("Error fetching users:", err);
			setError("No se pudieron cargar los usuarios del sistema");
		} finally {
			setLoading(false);
		}
	};

	// 2. useEffect con Debounce para reaccionar al buscador y al refreshKey
	useEffect(() => {
		const timer = setTimeout(() => {
			fetchUsers();
		}, 300);

		return () => clearTimeout(timer);
	}, [searchTerm, refreshKey]);

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

	// Manejo de Eliminación
	const handleDelete = async (id) => {
		const confirm = window.confirm("¿Estás seguro de eliminar este usuario?");
		if (!confirm) return;
		try {
			const token = localStorage.getItem('token');
			const headers = {};
			if (token) headers['Authorization'] = `Bearer ${token}`;
			
			await axios.delete(`http://localhost:8080/api/users/${id}`, { headers });
			fetchUsers();
		} catch (err) {
			console.error('Error deleting user', err);
			alert(err?.response?.data?.message || 'No se pudo eliminar el usuario');
		}
	};

	if (loading && users.length === 0) return <div className="p-10 text-center animate-pulse text-blue-500 font-bold">BUSCANDO USUARIOS...</div>;

	return (
		<>
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
							onSuccess={() => { fetchUsers(); handleCloseDialog(); }} 
							onClose={handleCloseDialog} 
						/>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
};

export default UserList;
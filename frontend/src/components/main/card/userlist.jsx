import React, { useEffect, useState } from "react";
import axios from "axios";
import UserCard from "./userscard"// Importamos la nueva card de usuario
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import UserForm from "../form/usersform";

const UserList = ({ darkMode = true }) => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Estados para el Modal (Ver / Editar)
	const [selectedUser, setSelectedUser] = useState(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogReadOnly, setDialogReadOnly] = useState(true);
	const [dialogIsEdit, setDialogIsEdit] = useState(false);

	// 1. Cargar usuarios desde el backend
	const fetchUsers = async () => {
		setLoading(true);
		try {
			const res = await axios.get("http://localhost:8080/api/users");
			// Manejamos si la respuesta es el array directo o viene envuelto
			setUsers(Array.isArray(res.data) ? res.data : (res.data.users || []));
		} catch (err) {
			console.error("Error fetching users:", err);
			setError("No se pudieron cargar los usuarios del sistema");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	// 2. Manejo de Visualización
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

	// 3. Manejo de Eliminación
	const handleDelete = async (id) => {
		const confirm = window.confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.");
		if (!confirm) return;
		try {
			const token = localStorage.getItem('token');
			const headers = {};
			if (token) headers['Authorization'] = `Bearer ${token}`;
			
			// Endpoint corregido para usuarios
			await axios.delete(`http://localhost:8080/api/users/${id}`, { headers });
			
			// Refrescar lista tras eliminar
			fetchUsers();
		} catch (err) {
			console.error('Error deleting user', err);
			const msg = err?.response?.data?.message || 'No se pudo eliminar el usuario';
			alert(msg);
		}
	};

	if (loading) return <div className="p-10 text-center animate-pulse">Cargando usuarios...</div>;
	if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

	if (!users.length) return <div className="p-10 text-center text-gray-600">No hay usuarios registrados</div>;

	return (
		<>
			{/* Grilla de Usuarios */}
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

			{/* Modal de Detalle / Edición de Usuario */}
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

				<DialogContent sx={{ mt: 2, borderColor: darkMode ? '#374151' : undefined }}>
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
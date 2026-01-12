import React, { useEffect, useState } from "react";
import axios from "axios";
import WorkerCard from "./workercard";
import WorkerForm from "../form/workersreport"; 
import { FiChevronLeft, FiChevronRight, FiX, FiEdit3 } from "react-icons/fi";
import { Dialog, DialogTitle, DialogContent, IconButton, Tooltip } from '@mui/material';

const WorkerList = ({ darkMode = true, searchTerm = "", refreshKey = 0 }) => {
	const [workers, setWorkers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	
	// Estados de Paginación
	const [pagination, setPagination] = useState({
		currentPage: 1,
		totalPages: 1,
		totalItems: 0
	});

	// Estados del Modal
	const [selectedWorker, setSelectedWorker] = useState(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogReadOnly, setDialogReadOnly] = useState(true);

	const fetchWorkers = async (page = 1) => {
		setLoading(true);
		setError(null); // Limpiamos errores anteriores al iniciar una nueva carga
		try {
			// --- LÓGICA DE RUTAS DINÁMICAS ---
			let url = `http://localhost:8080/api/workers?page=${page}`;
			
			// Si el usuario escribió en la searchbar, cambiamos al endpoint específico de búsqueda
			if (searchTerm) {
				// Usamos el parámetro ?search= porque es el que definimos en el controlador
				url = `http://localhost:8080/api/workers/search?search=${encodeURIComponent(searchTerm)}`;
			}

			console.log("Petición enviada a:", url);
			const res = await axios.get(url);
			
			if (searchTerm) {
				// Respuesta de Búsqueda: Suele ser un array directo [{}, {}]
				const searchData = Array.isArray(res.data) ? res.data : (res.data.workers || []);
				setWorkers(searchData);
				// Al buscar, forzamos que la paginación se resetee a 1 página
				setPagination({ currentPage: 1, totalPages: 1, totalItems: searchData.length });
			} else {
				// Respuesta Paginada: Estructura { workers: [], totalPages: ... }
				setWorkers(res.data.workers || []);
				setPagination({
					currentPage: res.data.currentPage || 1,
					totalPages: res.data.totalPages || 1,
					totalItems: res.data.totalItems || 0
				});
			}
		} catch (err) {
			console.error("Error al cargar trabajadores:", err);
			// Si el error es 404 en una búsqueda, significa que no hubo coincidencias
			if (err.response?.status === 404 && searchTerm) {
				setWorkers([]);
			} else {
				setError("No se pudo establecer conexión con el servidor");
			}
		} finally {
			setLoading(false);
		}
	};

	// Efecto para búsqueda con Debounce (300ms) para no saturar el servidor
	useEffect(() => {
		const timer = setTimeout(() => {
			fetchWorkers(1); // Siempre volvemos a la página 1 al buscar o refrescar
		}, 300);

		return () => clearTimeout(timer);
	}, [searchTerm, refreshKey]);

	// --- Lógica de Ver Detalles ---
	const handleView = (worker) => {
		setSelectedWorker(worker);
		setDialogReadOnly(true); 
		setDialogOpen(true);
	};

	// --- Lógica de Eliminación ---
	const handleDelete = async (id) => {
		const confirm = window.confirm("¿Estás seguro de eliminar a este trabajador?");
		if (!confirm) return;

		try {
			const token = localStorage.getItem('token');
			await axios.delete(`http://localhost:8080/api/workers/${id}`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			// Refrescar la página actual después de borrar
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

	// Estado de carga inicial
	if (loading && workers.length === 0) {
		return <div className="p-20 text-center text-blue-500 animate-pulse font-bold tracking-widest uppercase">Buscando trabajadores...</div>;
	}

	return (
		<div className="space-y-10 p-4">
			{/* Mensaje de Error (Texto rojo que viste en la imagen) */}
			{error && (
				<div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg text-center font-bold animate-bounce">
					{error}
				</div>
			)}

			{/* Mensaje si no hay resultados */}
			{!loading && workers.length === 0 ? (
				<div className="p-20 text-center text-gray-500 italic border-2 border-dashed border-gray-700 rounded-xl">
					No se encontraron trabajadores que coincidan con "{searchTerm}"
				</div>
			) : (
				<section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
			)}

			{/* CONTROLES DE PAGINACIÓN: Solo se muestran si NO estamos buscando */}
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
								// Lógica de visualización limitada de páginas
								if (pageNumber === 1 || pageNumber === pagination.totalPages || (pageNumber >= pagination.currentPage - 1 && pageNumber <= pagination.currentPage + 1)) {
									return (
										<button
											key={pageNumber}
											onClick={() => handlePageChange(pageNumber)}
											className={`w-10 h-10 rounded-lg font-bold transition-all ${
												pagination.currentPage === pageNumber ? "bg-blue-600 text-white shadow-lg scale-110" : darkMode ? "text-gray-400 hover:bg-gray-800" : "text-gray-600 hover:bg-gray-100"
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
						Total: {pagination.totalItems} trabajadores registrados
					</p>
				</div>
			)}

			{/* MODAL DE DETALLE / EDICIÓN */}
			<Dialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				maxWidth="sm"
				fullWidth
				PaperProps={{ 
					style: { 
						backgroundColor: darkMode ? '#1f2937' : '#ffffff', 
						color: darkMode ? '#ffffff' : '#000000',
						borderRadius: '16px'
					} 
				}}
			>
				<DialogTitle className="flex items-center justify-between border-b border-gray-700/30">
					<span className="font-bold text-lg uppercase tracking-tight">Perfil del Trabajador</span>
					<div className="flex items-center gap-2">
						{dialogReadOnly && (
							<Tooltip title="Editar Datos">
								<IconButton onClick={() => setDialogReadOnly(false)} className="text-blue-500">
									<FiEdit3 size={20} />
								</IconButton>
							</Tooltip>
						)}
						<IconButton onClick={() => setDialogOpen(false)}>
							<FiX size={24} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
						</IconButton>
					</div>
				</DialogTitle>

				<DialogContent className="mt-4 pb-6">
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
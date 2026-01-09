import React, { useEffect, useState } from "react";
import axios from "axios";
import WorkerCard from "./workercard";
import WorkerForm from "../form/workersreport"; // Asegúrate de que la ruta sea correcta
import { FiChevronLeft, FiChevronRight, FiX, FiEdit3 } from "react-icons/fi";
import { Dialog, DialogTitle, DialogContent, IconButton, Tooltip } from '@mui/material';

const WorkerList = ({ darkMode = true }) => {
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
		try {
			const res = await axios.get(`http://localhost:8080/api/workers?page=${page}`);
			
			// Según el backend pautado, recibimos { workers, totalPages, totalItems, currentPage }
			setWorkers(res.data.workers || []);
			setPagination({
				currentPage: res.data.currentPage || 1,
				totalPages: res.data.totalPages || 1,
				totalItems: res.data.totalItems || 0
			});
		} catch (err) {
			console.error("Error al cargar trabajadores:", err);
			setError("No se pudieron cargar los trabajadores");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchWorkers(pagination.currentPage);
	}, []);

	// --- Lógica de Ver Detalles ---
	const handleView = (worker) => {
		setSelectedWorker(worker);
		setDialogReadOnly(true); // Abrir en modo lectura
		setDialogOpen(true);
	};

	// --- Lógica de Eliminación ---
	const handleDelete = async (id) => {
		const confirm = window.confirm("¿Estás seguro de eliminar a este trabajador? Esta acción es irreversible.");
		if (!confirm) return;

		try {
			const token = localStorage.getItem('token');
			await axios.delete(`http://localhost:8080/api/workers/${id}`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			
			// Si eliminamos el último de la página, retroceder una página si es posible
			const nextPage = workers.length === 1 && pagination.currentPage > 1 
				? pagination.currentPage - 1 
				: pagination.currentPage;
			
			fetchWorkers(nextPage);
		} catch (err) {
			console.error("Error al eliminar:", err);
			alert(err.response?.data?.message || "Error al eliminar el trabajador");
		}
	};

	const handlePageChange = (newPage) => {
		if (newPage >= 1 && newPage <= pagination.totalPages) {
			fetchWorkers(newPage);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	};

	if (loading && workers.length === 0) return <div className="p-20 text-center text-blue-500 animate-pulse font-bold">CARGANDO TRABAJADORES...</div>;

	return (
		<div className="space-y-10 p-4">
			{error && <div className="text-center text-red-500 mb-4">{error}</div>}

			{/* Grid de 12 elementos */}
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

			{/* CONTROLES DE PAGINACIÓN */}
			{pagination.totalPages > 1 && (
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
						Total: {pagination.totalItems} trabajadores
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
					<span className="font-bold">Perfil del Trabajador</span>
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

				<DialogContent className="mt-4">
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
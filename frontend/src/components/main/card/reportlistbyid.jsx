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
import ReportWorker from "../form/reportworker"; 

const ReportListByID = ({ darkMode = true, searchTerm = "", refreshKey = 0 }) => {
	const [reports, setReports] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// --- VARIABLE DE ENTORNO ---
	const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

	const [selectedReport, setSelectedReport] = useState(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogReadOnly, setDialogReadOnly] = useState(true);
	const [dialogIsEdit, setDialogIsEdit] = useState(false);

	const fetchReports = async () => {
		setLoading(true);
		try {
			const token = localStorage.getItem('token');
			const userId = localStorage.getItem('userId');

			// Uso de API_URL
			let url = `${API_URL}/api/report/by-worker?id_worker=${userId}`;
			
			if (searchTerm) {
				url += `&caso=${encodeURIComponent(searchTerm)}`;
			}

			console.log("Peticiendo mis reportes a:", url);

			const res = await axios.get(url, {
				headers: { 'Authorization': `Bearer ${token}` }
			});

			setReports(Array.isArray(res.data) ? res.data : []);
			setError(null);
		} catch (err) {
			console.error("Error fetching worker reports:", err);
			setError("No se pudieron cargar tus reportes");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			fetchReports();
		}, 300);

		return () => clearTimeout(delayDebounceFn);
	}, [searchTerm, refreshKey]); 

	const handleView = (report) => {
		setSelectedReport(report);
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
		if (!window.confirm("¿Estás seguro de eliminar este reporte?")) return;
		try {
			const token = localStorage.getItem('token');
			// Uso de API_URL
			await axios.delete(`${API_URL}/api/report/${id}`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			fetchReports();
		} catch (err) {
			console.error('Error deleting report', err);
			alert('No se pudo eliminar el reporte');
		}
	};

	if (loading && reports.length === 0) {
		return <div className="p-10 text-center animate-pulse text-blue-500 font-bold tracking-widest">CARGANDO TUS REPORTES...</div>;
	}

	return (
		<>
			{error && <div className="p-4 text-center text-red-500 font-bold">{error}</div>}

			{reports.length === 0 && !loading ? (
				<div className="p-20 text-center text-gray-500 italic border-2 border-dashed border-gray-700 rounded-xl m-4">
					<p className="text-xl font-semibold">No tienes reportes registrados aún</p>
					{searchTerm && <p className="text-sm">No hay coincidencias para "{searchTerm}"</p>}
				</div>
			) : (
				<section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-4">
					{reports.map((r) => (
						<ReportCard 
							key={r.id} 
							report={r} 
							onView={handleView} 
							onDelete={handleDelete} 
							darkMode={darkMode} 
						/>
					))}
				</section>
			)}

			<Dialog
				open={dialogOpen}
				onClose={handleCloseDialog}
				maxWidth="md"
				fullWidth
				PaperProps={{ 
					style: { 
						backgroundColor: darkMode ? '#1f2937' : '#ffffff', 
						color: darkMode ? '#ffffff' : '#000000',
						borderRadius: '16px'
					} 
				}}
			>
				<DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: darkMode ? '1px solid #374151' : '1px solid #eee' }}>
					<span className="font-bold uppercase tracking-tight">
						{selectedReport ? (selectedReport.caso || `Reporte #${selectedReport.id}`) : 'Detalle'}
					</span>
					<div>
						{dialogReadOnly && (
							<Tooltip title="Editar mi reporte">
								<IconButton onClick={handleToggleEdit} size="small" sx={{ color: darkMode ? '#60a5fa' : '#2563eb', mr: 1 }}>
									<EditIcon />
								</IconButton>
							</Tooltip>
						)}
						<IconButton onClick={handleCloseDialog} size="small" sx={{ color: darkMode ? '#9ca3af' : '#6b7280' }}>
							<CloseIcon />
						</IconButton>
					</div>
				</DialogTitle>
				<DialogContent dividers sx={{ mt: 2, borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
					{selectedReport && (
						<ReportWorker 
							initialData={selectedReport} 
							isEdit={dialogIsEdit} 
							readOnlyDefault={dialogReadOnly} 
							darkMode={darkMode} 
							onSuccess={() => { fetchReports(); handleCloseDialog(); }} 
							onClose={handleCloseDialog} 
						/>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
};

export default ReportListByID;
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
import Reportform from "../form/report";

const ReportList = ({ darkMode = true }) => {
	const [reports, setReports] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// Dialog state for viewing / editing
	const [selectedReport, setSelectedReport] = useState(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogReadOnly, setDialogReadOnly] = useState(true);
	const [dialogIsEdit, setDialogIsEdit] = useState(false);

	const fetchReports = async () => {
		setLoading(true);
		try {
			const res = await axios.get("http://localhost:8080/api/report");
			setReports(Array.isArray(res.data) ? res.data : []);
		} catch (err) {
			console.error("Error fetching reports:", err);
			setError("No se pudieron cargar los reportes");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		let mounted = true;
		fetchReports();
		return () => (mounted = false);
	}, []);

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
		const confirm = window.confirm("¿Eliminar este reporte?");
		if (!confirm) return;
		try {
			await axios.delete(`http://localhost:8080/api/report/${id}`);
			// refresh
			fetchReports();
		} catch (err) {
			console.error('Error deleting report', err);
			alert('No se pudo eliminar el reporte');
		}
	};

	if (loading) return <div className="p-6 text-center">Cargando reportes...</div>;
	if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

	if (!reports.length) return <div className="p-6 text-center text-gray-600">No hay reportes para mostrar</div>;

	return (
		<>
			<section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-4">
				{reports.map((r) => (
					<ReportCard key={r.id ?? r.caso} report={r} onView={handleView} onDelete={handleDelete} darkMode={darkMode} />
				))}
			</section>

			{/* Detalle en modal */}
			<Dialog
				open={dialogOpen}
				onClose={handleCloseDialog}
				maxWidth="md"
				fullWidth
				PaperProps={{ style: { backgroundColor: darkMode ? '#1f2937' : '#ffffff', color: darkMode ? '#ffffff' : '#000000' } }}
			>
				<DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					{selectedReport ? (selectedReport.caso || `Reporte #${selectedReport.id}`) : 'Detalle del reporte'}
					<div>
						{dialogReadOnly && (
							<Tooltip title="Editar">
								<IconButton onClick={handleToggleEdit} size="small">
									<EditIcon />
								</IconButton>
							</Tooltip>
						)}
						<IconButton onClick={handleCloseDialog} size="small"><CloseIcon /></IconButton>
					</div>
				</DialogTitle>
				<DialogContent sx={{ borderColor: darkMode ? '#374151' : undefined }}>
					{selectedReport && (
						<Reportform initialData={selectedReport} isEdit={dialogIsEdit} readOnlyDefault={dialogReadOnly} darkMode={darkMode} onSuccess={() => { fetchReports(); handleCloseDialog(); }} onClose={handleCloseDialog} />
					)}
				</DialogContent>
			</Dialog>
		</>
	);
};

export default ReportList;

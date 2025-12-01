import React, { useEffect, useState } from "react";
import axios from "axios";
import ReportCard from "./reportcard";

const ReportList = () => {
	const [reports, setReports] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let mounted = true;

		const fetchReports = async () => {
			setLoading(true);
			try {
				const res = await axios.get("http://localhost:8080/api/report");
				if (mounted) {
					setReports(Array.isArray(res.data) ? res.data : []);
				}
			} catch (err) {
				console.error("Error fetching reports:", err);
				if (mounted) setError("No se pudieron cargar los reportes");
			} finally {
				if (mounted) setLoading(false);
			}
		};

		fetchReports();

		return () => (mounted = false);
	}, []);

	const handleView = (report) => {
		// placeholder: open modal or navigate to details
		alert(`Ver reporte: ${report.caso || report.id}`);
	};

	if (loading) return <div className="p-6 text-center">Cargando reportes...</div>;
	if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

	if (!reports.length) return <div className="p-6 text-center text-gray-600">No hay reportes para mostrar</div>;

	return (
		<section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-4">
			{reports.map((r) => (
				<ReportCard key={r.id ?? r.caso} report={r} onView={handleView} />
			))}
		</section>
	);
};

export default ReportList;

import React from "react";

const ReportCard = ({ report = {}, onView, onDelete, darkMode = true }) => {
	const {
		id,
		caso,
		descripcion,
		estado,
		fecha,
		area,
		nombre_natural,
	} = report;

	const statusColor = () => {
		switch ((estado || "").toLowerCase()) {
			case "abierto":
			case "open":
				return "bg-green-100 text-green-800";
			case "en proceso":
			case "in progress":
				return "bg-yellow-100 text-yellow-800";
			case "cerrado":
			case "closed":
				return "bg-gray-100 text-gray-800";
			case "urgente":
				return "bg-red-100 text-red-800";
			default:
				return "bg-blue-100 text-blue-800";
		}
	};

	const cardBg = darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-100 text-gray-800";
	const actionBorder = darkMode ? "border-gray-700" : "border-gray-50";

	function formatDateShort(dateStr) {
		if (!dateStr) return "-";
		try {
			const d = new Date(dateStr);
			const dd = String(d.getDate()).padStart(2, '0');
			const mm = String(d.getMonth() + 1).padStart(2, '0');
			const yyyy = String(d.getFullYear());
			return `${dd}/${mm}/${yyyy}`;
		} catch (e) { return dateStr; }
	}
	return (
		<article className={`${cardBg} rounded-lg shadow-sm p-4 border flex flex-col gap-4`}>
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1">
					<h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{caso || `Reporte #${id ?? "-"}`}</h3>
					<p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
						{descripcion || "Sin descripción"}
					</p>
					<div className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
						<span className="mr-3">{area ? `Área: ${area}` : null}</span>
						<span>{nombre_natural ? `Reportado por: ${nombre_natural}` : null}</span>
					</div>
				</div>

				<div className="flex flex-col items-end gap-1 min-w-fit">
					<span className={`${statusColor()} px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap`}>
						{estado || "Sin estado"}
					</span>
					<span className={`text-[10px] uppercase font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
						{fecha ? formatDateShort(fecha) : "-"}
					</span>
				</div>
			</div>

			{/* Fila de acciones: Botones en extremos opuestos */}
			<div className={`flex justify-between items-center pt-2 border-t ${actionBorder}`}>
				<button
					onClick={() => onDelete && onDelete(id)}
					className={`text-gray-500 ${darkMode ? 'hover:text-white hover:bg-red-600' : 'hover:text-white hover:bg-red-600'} border border-transparent hover:border-red-600 px-3 py-1.5 rounded-md text-sm transition-all duration-200 flex items-center gap-1`}
				>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
					Eliminar
				</button>

				<button
					onClick={() => onView && onView(report)}
					className="bg-blue-600 text-white px-5 py-1.5 rounded-md hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm"
				>
					Ver detalles
				</button>
			</div>
		</article>
	);
};

export default ReportCard;
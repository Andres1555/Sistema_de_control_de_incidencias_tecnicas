import React from "react";
import { FaClipboardList, FaMapMarkerAlt, FaUser, FaTrash, FaEye, FaCalendarAlt } from "react-icons/fa";

const ReportCard = ({ report = {}, onView, onDelete, darkMode = true }) => {
	const { id, caso, descripcion, estado, fecha, area, nombre_natural } = report;

	const statusColor = () => {
		switch ((estado || "").toLowerCase()) {
			case "abierto": case "open": return "bg-green-500/20 text-green-400 border-green-500/50";
			case "en proceso": case "in progress": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
			case "cerrado": case "closed": return "bg-gray-500/20 text-gray-400 border-gray-500/50";
			case "urgente": return "bg-red-500/20 text-red-400 border-red-500/50";
			default: return "bg-blue-500/20 text-blue-400 border-blue-500/50";
		}
	};

	const cardBg = darkMode ? "bg-[#1a222f] border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-800";
	const secondaryText = darkMode ? "text-gray-400" : "text-gray-500";

	function formatDateShort(dateStr) {
		if (!dateStr) return "-";
		try {
			const d = new Date(dateStr);
			return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
		} catch (e) { return dateStr; }
	}

	return (
		<article className={`${cardBg} rounded-xl shadow-md p-5 border flex flex-col h-full min-h-[240px] transition-all hover:shadow-lg`}>
			<div className="flex-1">
				<div className="flex justify-between items-start gap-2 mb-3">
					<div className="flex gap-2">
						<FaClipboardList className="text-blue-500 mt-1 shrink-0" size={14} />
						<h3 className="text-lg font-bold leading-tight uppercase line-clamp-1">
							{caso || `Reporte #${id}`}
						</h3>
					</div>
					<div className="flex flex-col items-end shrink-0">
						<span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase mb-1 ${statusColor()}`}>
							{estado || "S/E"}
						</span>
						<p className="text-[10px] text-gray-500 font-bold uppercase">{formatDateShort(fecha)}</p>
					</div>
				</div>

				<p className={`text-sm mb-4 line-clamp-2 italic ${secondaryText}`}>
					"{descripcion || "Sin descripción"}"
				</p>

				<div className="space-y-1.5">
					<p className={`text-[11px] flex items-center gap-2 ${secondaryText}`}>
						<FaMapMarkerAlt className="text-blue-400" size={11} /> 
						<strong>Área:</strong> {area || "No especificada"}
					</p>
					<p className={`text-[11px] flex items-center gap-2 ${secondaryText}`}>
						<FaUser className="text-blue-400" size={11} /> 
						<strong>Reportado por:</strong> {nombre_natural || "Anónimo"}
					</p>
				</div>
			</div>

			<div className="mt-5 pt-4 border-t border-gray-700/50 flex justify-between items-center">
				<button
					onClick={() => onDelete && onDelete(id)}
					className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#242d3c] hover:bg-red-600 text-gray-300 hover:text-white rounded-lg transition-all"
				>
					<FaTrash size={12} /> Eliminar
				</button>
				<button
					onClick={() => onView && onView(report)}
					className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#242d3c] hover:bg-blue-600 text-gray-300 hover:text-white rounded-lg transition-all"
				>
					<FaEye size={14} /> Ver detalles
				</button>
			</div>
		</article>
	);
};

export default ReportCard;
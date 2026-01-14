import React from "react";
import { FaWrench, FaUserCog, FaFileAlt, FaTrash, FaEye, FaClock } from "react-icons/fa";

const ReportTechCard = ({ report = {}, onView, onDelete, darkMode = true }) => {
	const { id, id_user, id_report, caso_tecnico, resolucion, tiempo, createdAt } = report;

	// OBTENER EL NOMBRE DEL TÉCNICO DESDE EL LOCALSTORAGE
	const techName = localStorage.getItem('userName') || "Técnico Asignado";

	const cardBg = darkMode ? "bg-[#1a222f] border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-800";
	const secondaryText = darkMode ? "text-gray-400" : "text-gray-500";

	const dateStr = createdAt ? new Date(createdAt).toLocaleDateString() : "---";

	return (
		<article className={`${cardBg} rounded-xl shadow-md p-5 border flex flex-col h-full min-h-[240px] transition-all hover:shadow-lg`}>
			<div className="flex-1">
				<div className="flex justify-between items-start gap-2 mb-3">
					<div className="flex gap-2">
						{/* Icono en naranja para identificar que es técnico */}
						<FaWrench className="text-orange-500 mt-1 shrink-0" size={14} />
						<h3 className="text-lg font-bold leading-tight uppercase line-clamp-1">
							{caso_tecnico || `Caso Técnico #${id}`}
						</h3>
					</div>
					<div className="text-right shrink-0">
						<p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Registrado</p>
						<p className="text-[11px] font-semibold">{dateStr}</p>
					</div>
				</div>

				<p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
					{resolucion || "Sin resolución registrada aún."}
				</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
					<p className={`text-[11px] flex items-center gap-2 ${secondaryText}`}>
						<FaFileAlt className="text-orange-400" size={11} /> 
						<strong>Ref Reporte:</strong> #{id_report}
					</p>
					
					{/* Muestra el nombre guardado en el localStorage */}
					<p className={`text-[11px] flex items-center gap-2 ${secondaryText}`}>
						<FaUserCog className="text-orange-400" size={11} /> 
						<strong>Técnico:</strong> {techName}
					</p>

					{/* Cambio de etiqueta solicitado */}
					{tiempo && (
						<p className={`text-[11px] flex items-center gap-2 ${secondaryText} col-span-2`}>
							<FaClock className="text-orange-400" size={11} /> 
							<strong>Hora de la resolución:</strong> {tiempo}
						</p>
					)}
				</div>
			</div>

			{/* Fila de acciones fija en el fondo */}
			<div className="mt-5 pt-4 border-t border-gray-700/50 flex justify-between items-center">
				<button
					onClick={() => onDelete && onDelete(id)}
					className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#242d3c] hover:bg-red-600 text-gray-300 hover:text-white rounded-lg transition-all"
				>
					<FaTrash size={12} /> Eliminar
				</button>
				<button
					onClick={() => onView && onView(report)}
					className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#242d3c] hover:bg-orange-600 text-gray-300 hover:text-white rounded-lg transition-all"
				>
					<FaEye size={14} /> Ver detalles
				</button>
			</div>
		</article>
	);
};

export default ReportTechCard;
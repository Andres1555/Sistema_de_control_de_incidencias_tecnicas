import React from "react";
import { FaUser, FaIdCard, FaBuilding, FaTrash, FaEye } from "react-icons/fa";

const WorkerCard = ({ worker = {}, onView, onDelete, darkMode = true }) => {
	const { id, ficha, nombres, apellidos, anio_nac, mes_nac, dia_nac, dpto, gcia } = worker;

	const cardBg = darkMode ? "bg-[#1a222f] border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-800";
	const secondaryText = darkMode ? "text-gray-400" : "text-gray-500";

	const birthDate = dia_nac && mes_nac && anio_nac 
		? `${String(dia_nac).padStart(2, '0')}/${String(mes_nac).padStart(2, '0')}/${anio_nac}`
		: "23/01/1976"; // Ejemplo de tu foto

	return (
		<article className={`${cardBg} rounded-xl shadow-md p-5 border flex flex-col h-full min-h-[220px] transition-all hover:shadow-lg`}>
			{/* CONTENIDO SUPERIOR (Crecimiento flexible) */}
			<div className="flex-1">
				<div className="flex justify-between items-start gap-2 mb-3">
					<div className="flex gap-2">
						<FaUser className="text-blue-500 mt-1 shrink-0" size={14} />
						<h3 className="text-lg font-bold leading-tight uppercase">
							{nombres} {apellidos}
						</h3>
					</div>
					<div className="text-right shrink-0">
						<p className="text-[9px] text-gray-500 font-bold uppercase">Nacimiento</p>
						<p className="text-[11px] font-semibold">{birthDate}</p>
					</div>
				</div>

				<div className="space-y-1">
					<p className="text-sm font-medium text-blue-400 flex items-center gap-2">
						<FaIdCard size={13} /> Ficha: {ficha}
					</p>
					<div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
						<p className={`text-[11px] flex items-center gap-1 ${secondaryText}`}>
							<FaBuilding size={11} /> <strong>Gerencia:</strong> {gcia}
						</p>
						<p className={`text-[11px] flex items-center gap-1 ${secondaryText}`}>
							<FaBuilding size={11} /> <strong>Dpto:</strong> {dpto}
						</p>
					</div>
				</div>
			</div>

			{/* BOTONES POSICIÓN FIJA (Footer) */}
			<div className="mt-5 pt-4 border-t border-gray-700/50 flex justify-between items-center">
				<button
					onClick={() => onDelete && onDelete(id)}
					className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#242d3c] hover:bg-red-600 text-gray-300 hover:text-white rounded-lg transition-all"
				>
					<FaTrash size={12} /> Eliminar
				</button>

				<button
					onClick={() => onView && onView(worker)} // Asegúrate de que pase el objeto worker completo
					className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#242d3c] hover:bg-blue-600 text-gray-300 hover:text-white rounded-lg transition-all"
				>
					<FaEye size={14} /> Ver detalles
				</button>
			</div>
		</article>
	);
};

export default WorkerCard;
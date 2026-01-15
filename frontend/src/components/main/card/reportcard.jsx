import React from "react";
import { FaClipboardList, FaMapMarkerAlt, FaUser, FaTrash, FaEye, FaCheckCircle } from "react-icons/fa";

const ReportCard = ({ report = {}, onView, onDelete, darkMode = true }) => {
    const { id, caso, descripcion, estado, fecha, area, nombre_natural } = report;
    
    // Extraemos el nombre del usuario actual para el "Solucionado por" de frontend
    const currentUserName = localStorage.getItem('userName') || "Técnico";
    const userRole = localStorage.getItem('role')?.toLowerCase();
    const isWorker = userRole === 'worker';

    const isResolved = (estado || "").toLowerCase() === "resuelto" || (estado || "").toLowerCase() === "resolved";

    const statusColor = () => {
        const s = (estado || "").toLowerCase();
        switch (s) {
            case "resuelto": case "resolved": return "bg-green-500 text-white border-green-600";
            case "en revision": case "en revisión": case "en proceso": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
            case "en espera": case "abierto": case "urgente": case "pendiente": return "bg-red-500/20 text-red-400 border-red-500/50";
            default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
        }
    };

    const cardBg = darkMode ? "bg-[#1a222f] border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900";
    const secondaryText = darkMode ? "text-gray-400" : "text-gray-600";

    return (
        <article className={`${cardBg} rounded-xl shadow-md p-4 md:p-5 border flex flex-col h-full min-h-[260px] transition-all hover:shadow-lg`}>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="flex gap-2 min-w-0 flex-1">
                        <FaClipboardList className="text-blue-500 mt-1 shrink-0" size={14} />
                        <h3 className="text-sm md:text-base font-black leading-tight uppercase truncate">
                            {caso || `Reporte #${id}`}
                        </h3>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase mb-1 ${statusColor()}`}>
                            {estado || "S/E"}
                        </span>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">
                            {fecha ? new Date(fecha).toLocaleDateString() : "--/--/--"}
                        </p>
                    </div>
                </div>

                <p className={`text-xs md:text-sm mb-4 line-clamp-2 italic opacity-80 font-medium ${secondaryText}`}>
                    "{descripcion || "Sin descripción"}"
                </p>

                <div className="space-y-1.5">
                    <p className={`text-[10px] md:text-[11px] flex items-center gap-2 ${secondaryText}`}>
                        <FaMapMarkerAlt className="text-blue-400 shrink-0" size={11} /> 
                        <span className="truncate"><strong className="font-black uppercase">Área:</strong> {area || "N/A"}</span>
                    </p>
                    <p className={`text-[10px] md:text-[11px] flex items-center gap-2 ${secondaryText}`}>
                        <FaUser className="text-blue-400 shrink-0" size={11} /> 
                        <span className="truncate"><strong className="font-black uppercase">Por:</strong> {nombre_natural || "Anónimo"}</span>
                    </p>

                    {/* CAMPO NUEVO: Solo aparece si el estado es Resuelto */}
                    {isResolved && (
                        <p className={`text-[10px] md:text-[11px] flex items-center gap-2 text-green-500 animate-in fade-in duration-500`}>
                            <FaCheckCircle className="shrink-0" size={11} /> 
                            <span className="truncate"><strong className="font-black uppercase">Solucionado por:</strong> {currentUserName}</span>
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-500/30 flex items-center gap-2">
                {!isWorker && (
                    <button
                        onClick={() => onDelete && onDelete(id)}
                        className="flex-1 h-10 flex items-center justify-center gap-2 px-2 bg-[#1a1a1a] hover:bg-red-700 text-red-600 hover:text-white rounded-xl text-[11px] font-black transition-all uppercase shadow-sm active:scale-95 border border-transparent"
                    >
                        <FaTrash size={12} /> <span>Eliminar</span>
                    </button>
                )}
                <button
                    onClick={() => onView && onView(report)}
                    className={`${isWorker ? 'w-full' : 'flex-1'} h-10 flex items-center justify-center gap-2 px-2 bg-[#1a1a1a] hover:bg-blue-600 text-white rounded-xl text-[11px] font-black transition-all uppercase shadow-sm active:scale-95 border border-transparent`}
                >
                    <FaEye size={14} /> <span>Detalles</span>
                </button>
            </div>
        </article>
    );
};

export default ReportCard;
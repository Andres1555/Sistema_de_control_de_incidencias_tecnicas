import React from "react";
import { FaWrench, FaUserCog, FaFileAlt, FaTrash, FaEye } from "react-icons/fa";

const ReportTechCard = ({ report = {}, onView, onDelete, darkMode = true }) => {
    const { id, id_report, caso_tecnico, resolucion, createdAt } = report;
    const techName = localStorage.getItem('userName') || "Técnico";

    const cardBg = darkMode ? "bg-[#1a222f] border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-800";
    const secondaryText = darkMode ? "text-gray-400" : "text-gray-500";

    return (
        <article className={`${cardBg} rounded-xl shadow-md p-4 md:p-5 border flex flex-col h-full min-h-[260px] transition-all hover:shadow-lg no-blur`}>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="flex gap-2 min-w-0 flex-1">
                        <FaWrench className="text-orange-500 mt-1 shrink-0" size={14} />
                        <h3 className="text-sm md:text-base font-black leading-tight uppercase truncate">
                            {caso_tecnico || `Caso #${id}`}
                        </h3>
                    </div>
                    <p className="text-[10px] font-bold opacity-60 shrink-0">
                        {createdAt ? new Date(createdAt).toLocaleDateString() : "--/--"}
                    </p>
                </div>

                <p className={`text-xs md:text-sm mb-4 line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {resolucion || "Sin resolución registrada."}
                </p>

                <div className="space-y-1.5">
                    <div className={`text-[10px] md:text-[11px] flex items-center gap-2 ${secondaryText}`}>
                        <FaFileAlt className="text-orange-400 shrink-0" size={11} /> 
                        <span className="truncate"><strong className="font-black uppercase">Ref:</strong> #{id_report}</span>
                    </div>
                    <div className={`text-[10px] md:text-[11px] flex items-center gap-2 ${secondaryText}`}>
                        <FaUserCog className="text-orange-400 shrink-0" size={11} /> 
                        <span className="truncate"><strong className="font-black uppercase">Técnico:</strong> {techName}</span>
                    </div>
                </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="mt-5 pt-4 border-t border-gray-700/30 flex items-center gap-2">
                <button
                    onClick={() => onDelete && onDelete(id)}
                    /* ESTILO: Letras Rojo Sólido, Borde Rojo, Fondo Claro */
                    className={`flex-1 h-10 flex items-center justify-center gap-2 px-2 rounded-xl text-[11px] font-black transition-all uppercase shadow-sm active:scale-95 border-2 ${
                        darkMode 
                        ? "bg-transparent border-red-600 text-red-500 hover:bg-red-600 hover:text-white" 
                        : "bg-white border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                    }`}
                >
                    <FaTrash size={12} /> <span>Eliminar</span>
                </button>
                
                <button
                    onClick={() => onView && onView(report)}
                    /* ESTILO: Fondo Negro Sólido, Letras Blancas */
                    className="flex-1 h-10 flex items-center justify-center gap-2 px-2 bg-[#1a1a1a] hover:bg-orange-600 text-white rounded-xl text-[11px] font-black transition-all uppercase shadow-md active:scale-95 border border-transparent"
                >
                    <FaEye size={14} /> <span>Detalles</span>
                </button>
            </div>
        </article>
    );
};

export default ReportTechCard;
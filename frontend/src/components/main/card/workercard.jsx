import React from "react";
import { FaUser, FaIdCard, FaBuilding, FaTrash, FaEye } from "react-icons/fa";

const WorkerCard = ({ worker = {}, onView, onDelete, darkMode = true }) => {
    const { id, ficha, nombres, apellidos, dpto, gcia } = worker;

    const cardBg = darkMode ? "bg-[#1a222f] border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-800";
    const secondaryText = darkMode ? "text-gray-400" : "text-gray-500";

    return (
        <article className={`${cardBg} rounded-xl shadow-md p-4 md:p-5 border flex flex-col h-full min-h-[260px] transition-all hover:shadow-lg no-blur overflow-hidden`}>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm md:text-base font-black flex items-center gap-2 uppercase truncate">
                            <FaUser className="text-blue-500 text-xs shrink-0" />
                            <span className="truncate">{nombres} {apellidos}</span>
                        </h3>
                        <p className={`mt-1 text-[10px] md:text-xs flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <FaIdCard className="text-[10px] text-blue-400 shrink-0" />
                            Ficha: {ficha || "N/A"}
                        </p>
                    </div>
                </div>

                <div className="mt-2 space-y-1.5">
                    <div className={`text-[10px] flex items-center gap-2 ${secondaryText}`}>
                        <FaBuilding className="shrink-0 text-blue-400" size={10} /> 
                        <span className="truncate"><strong className="font-black uppercase">Gcia:</strong> {gcia || "N/A"}</span>
                    </div>
                    <div className={`text-[10px] flex items-center gap-2 ${secondaryText}`}>
                        <FaBuilding className="shrink-0 text-blue-400" size={10} /> 
                        <span className="truncate"><strong className="font-black uppercase">Dpto:</strong> {dpto || "N/A"}</span>
                    </div>
                </div>
            </div>

            {/* BOTONES DE ACCIÓN UNIFICADOS */}
            <div className="flex items-center gap-2 pt-4 mt-auto border-t border-gray-700/30">
                <button
                    onClick={() => onDelete && onDelete(id)}
                    /* ESTILO: Letras Rojo Sólido, Borde Rojo, Fondo Claro */
                    className={`flex-1 h-10 flex items-center justify-center gap-2 rounded-xl text-[11px] font-black transition-all uppercase shadow-sm active:scale-95 border-2 ${
                        darkMode 
                        ? "bg-transparent border-red-600 text-red-500 hover:bg-red-600 hover:text-white" 
                        : "bg-white border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                    }`}
                >
                    <FaTrash size={12} /> <span>Eliminar</span>
                </button>

                <button
                    onClick={() => onView && onView(worker)}
                    /* ESTILO: Fondo Negro Sólido, Letras Blancas */
                    className="flex-1 h-10 flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-blue-600 text-white rounded-xl text-[11px] font-black transition-all uppercase shadow-md active:scale-95 border border-transparent"
                >
                    <FaEye size={14} /> <span>Detalles</span>
                </button>
            </div>
        </article>
    );
};

export default WorkerCard;
import React from "react";
import { FaUser, FaEnvelope, FaIdCard, FaTrash, FaEye } from "react-icons/fa";

const UserCard = ({ user = {}, onView, onDelete, darkMode = true }) => {
    const { id, nombre, apellido, correo, ficha, C_I, rol } = user;

    const roleBadgeColor = () => {
        switch ((rol || "").toLowerCase()) {
            case "admin": case "administrador": return "bg-purple-600 text-white border-purple-700";
            case "tecnico": case "técnico": return "bg-blue-600 text-white border-blue-700";
            default: return "bg-gray-600 text-white border-gray-700";
        }
    };

    const cardBg = darkMode ? "bg-[#1a222f] border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-800";
    const secondaryText = darkMode ? "text-gray-400" : "text-gray-500";

    return (
        <article className={`${cardBg} rounded-xl shadow-md p-4 md:p-5 border flex flex-col h-full min-h-[260px] transition-all hover:shadow-lg no-blur`}>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm md:text-base font-black flex items-center gap-2 uppercase truncate">
                            <FaUser className="text-blue-500 text-xs shrink-0" />
                            <span className="truncate">{nombre} {apellido}</span>
                        </h3>
                        <p className={`mt-1 text-[10px] md:text-xs flex items-center gap-2 truncate opacity-70 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <FaEnvelope className="shrink-0 text-[10px]" />
                            <span className="truncate">{correo}</span>
                        </p>
                    </div>
                    {/* Badge de rol ahora sólido para hacer juego con el resto */}
                    <span className={`shrink-0 px-2 py-0.5 rounded-md text-[8px] font-black border uppercase tracking-wider shadow-sm ${roleBadgeColor()}`}>
                        {rol || "User"}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className={`text-[10px] flex items-center gap-1.5 font-bold ${secondaryText}`}>
                        <FaIdCard className="shrink-0 text-blue-400" /> <span className="truncate uppercase">CI: {C_I}</span>
                    </div>
                    <div className={`text-[10px] flex items-center gap-1.5 font-bold ${secondaryText}`}>
                        <FaIdCard className="shrink-0 text-blue-400" /> <span className="truncate uppercase">Ficha: {ficha}</span>
                    </div>
                </div>
            </div>

            {/* BOTONES UNIFICADOS */}
            <div className="flex gap-2 pt-4 mt-4 border-t border-gray-700/30">
                <button
                    onClick={() => onDelete && onDelete(id)}
                    /* ESTILO: Letras Rojo Sólido, Borde Rojo, Fondo Blanco/Transparente */
                    className={`flex-1 h-10 flex items-center justify-center gap-2 rounded-xl text-[11px] font-black transition-all uppercase shadow-sm active:scale-95 border-2 ${
                        darkMode 
                        ? "bg-transparent border-red-600 text-red-500 hover:bg-red-600 hover:text-white" 
                        : "bg-white border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                    }`}
                >
                    <FaTrash size={12} /> <span>Eliminar</span>
                </button>

                <button
                    onClick={() => onView && onView(user)}
                    /* ESTILO: Bloque Negro Sólido, Letras Blancas */
                    className="flex-1 h-10 flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-blue-600 text-white rounded-xl text-[11px] font-black transition-all uppercase shadow-md active:scale-95 border border-transparent"
                >
                    <FaEye size={14} /> <span>Detalles</span>
                </button>
            </div>
        </article>
    );
};

export default UserCard;
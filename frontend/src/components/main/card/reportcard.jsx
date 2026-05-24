import React from "react";
import { FaClipboardList, FaMapMarkerAlt, FaUser, FaTrash, FaEye, FaCheckCircle, FaBriefcase, FaArrowUp } from "react-icons/fa";

const ReportCard = ({ report = {}, onView, onDelete, onEscalate, darkMode = true }) => {
    // Extraemos los datos básicos del reporte
    const { id, caso, descripcion, estado, fecha, area, nombre_natural, cargo, departamento } = report;

    // 1. DETERMINA EL NOMBRE DEL CREADOR (Reporte -> User o Worker)
    const reporterName = (() => {
        if (report.User) {
            const u = report.User;
            return [u.nombre, u.apellido].filter(Boolean).join(' ').trim() || "Usuario";
        }
        if (report.Worker) {
            const w = report.Worker;
            return [w.nombres, w.apellidos].filter(Boolean).join(' ').trim() || "Trabajador";
        }
        return nombre_natural || "Anónimo";
    })();
    
    // 2. DETERMINA EL NOMBRE DEL TÉCNICO QUE SOLUCIONÓ (CAMBIO CLAVE)
    // Buscamos en la relación ReportCases -> User que viene de la DB
    const solverName = (() => {
        if (report.ReportCases && report.ReportCases.length > 0) {
            // Tomamos el primer caso técnico (la resolución)
            const tech = report.ReportCases[0].User; 
            if (tech) {
                return `${tech.nombre} ${tech.apellido}`.trim();
            }
        }
        return "Técnico Asignado";
    })();

    const userRole = localStorage.getItem('role')?.toLowerCase();
    const isWorker = userRole === 'worker';

    const isResolved = (estado || "").toLowerCase() === "resuelto" || (estado || "").toLowerCase() === "resolved";

    const statusColor = () => {
        const s = (estado || "").toLowerCase();
        switch (s) {
            case "resuelto": case "resolved": return "bg-green-500 text-white border-green-600";
            case "en revision": case "en revisión": case "en proceso": case "en resolución": case "en resolucion": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
            case "en espera": case "abierto": case "urgente": case "pendiente": return "bg-red-500/20 text-red-400 border-red-500/50";
            default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
        }
    };

    const cardBg = darkMode ? "bg-[#1a222f] border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-800";
    const secondaryText = darkMode ? "text-gray-400" : "text-gray-500";

    return (
        <article className={`${cardBg} rounded-xl shadow-md p-4 md:p-5 border flex flex-col h-full min-h-[260px] transition-all hover:shadow-lg no-blur`}>
            
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="flex gap-2 min-w-0 flex-1">
                        <FaClipboardList className="text-blue-500 mt-1 shrink-0" size={14} />
                        <h3 className="text-sm md:text-base font-black leading-tight uppercase truncate">
                            {caso || `Reporte #${id}`}
                        </h3>
                    </div>
                    <div className="flex flex-col items-end shrink-0 gap-1.5">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${statusColor()}`}>
                            {estado || "S/E"}
                        </span>
                        <p className="text-[9px] opacity-60 font-bold uppercase tracking-tighter">
                            {fecha ? (() => {
                                const [y, m, d] = fecha.split('-');
                                return `${d}/${m}/${y}`;
                            })() : "--/--/--"}
                        </p>
                        {!isWorker && (
                            <button
                                onClick={() => onEscalate && onEscalate(report)}
                                title="Escalar Reporte"
                                className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500 hover:text-white transition-all shadow-sm active:scale-90"
                            >
                                <FaArrowUp size={10} />
                            </button>
                        )}
                    </div>
                </div>

                <p className={`text-xs md:text-sm mb-4 line-clamp-2 italic opacity-80 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    "{descripcion || "Sin descripción"}"
                </p>

                <div className="space-y-1.5">
                    <div className={`text-[10px] md:text-[11px] flex items-center gap-2 ${secondaryText}`}>
                        <FaMapMarkerAlt className="text-blue-400 shrink-0" size={11} /> 
                        <span className="truncate"><strong className="font-black uppercase">Área:</strong> {area || "N/A"}</span>
                    </div>
                    
                    <div className={`text-[10px] md:text-[11px] flex items-center gap-2 ${secondaryText}`}>
                        <FaUser className="text-blue-400 shrink-0" size={11} /> 
                        <span className="truncate"><strong className="font-black uppercase">Por:</strong> {reporterName}</span>
                    </div>
                    
                    <div className={`text-[10px] md:text-[11px] flex items-center gap-2 ${secondaryText}`}>
                        <FaBriefcase className="text-blue-400 shrink-0" size={11} /> 
                        <span className="truncate"><strong className="font-black uppercase">Cargo:</strong> {cargo || "No especificado"}</span>
                    </div>

                    {isResolved && (
                        <div className={`text-[10px] md:text-[11px] flex items-center gap-2 text-green-500 animate-in fade-in duration-500`}>
                            <FaCheckCircle className="shrink-0" size={11} /> 
                            <span className="truncate">
                                <strong className="font-black uppercase">Solucionado por:</strong> {solverName}
                            </span>
                        </div>
                    )}

                    {!isResolved && report.resuelto_por && (
                        <div className={`text-[10px] md:text-[11px] flex items-center gap-2 text-amber-500 animate-in fade-in duration-500`}>
                            <FaCheckCircle className="shrink-0" size={11} /> 
                            <span className="truncate">
                                <strong className="font-black uppercase">En resolución por:</strong> {report.resuelto_por_nombre || "Técnico"}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className={`mt-5 pt-4 border-t ${darkMode ? 'border-gray-700/50' : 'border-gray-200'} flex items-center gap-2`}>
                {!isWorker && (
                    <button
                        onClick={() => onDelete && onDelete(id)}
                        className={`flex-1 h-10 flex items-center justify-center gap-2 px-2 rounded-xl text-[11px] font-black transition-all uppercase shadow-sm active:scale-95 border-2 ${
                            darkMode 
                            ? "bg-transparent border-red-600 text-red-500 hover:bg-red-600 hover:text-white" 
                            : "bg-white border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                        }`}
                    >
                        <FaTrash size={12} /> <span>Eliminar</span>
                    </button>
                )}
                <button
                    onClick={() => onView && onView(report)}
                    className={`${isWorker ? 'w-full' : 'flex-1'} h-10 flex items-center justify-center gap-2 px-2 bg-[#1a1a1a] hover:bg-blue-600 text-white rounded-xl text-[11px] font-black transition-all uppercase shadow-md active:scale-95 border border-transparent`}
                >
                    <FaEye size={14} /> <span>Detalles</span>
                </button>
            </div>
        </article>
    );
};

export default ReportCard;
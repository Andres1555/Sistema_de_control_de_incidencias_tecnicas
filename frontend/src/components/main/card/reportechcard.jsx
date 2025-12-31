import React from "react";

const ReportTechCard = ({ report = {}, onView, onDelete, darkMode = true }) => {
  const { id, id_user, id_report, caso_tecnico, resolucion, tiempo, createdAt } = report;

  const cardBg = darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-100 text-gray-800';
  const actionBorder = darkMode ? 'border-gray-700' : 'border-gray-50';
  return (
    <article className={`${cardBg} rounded-lg shadow-sm p-4 border`}>
      <div>
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{caso_tecnico || `Caso #${id ?? "-"}`}</h3>
        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{(resolucion || "Sin resolución").slice(0, 140)}</p>
        <div className={`mt-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <span className="mr-3">{id_report ? `Reporte: ${id_report}` : null}</span>
          <span>{id_user ? `Técnico: ${id_user}` : null}</span>
        </div>
      </div>

      {/* Fila de acciones: Botones en extremos opuestos (Eliminar a la izquierda, Ver a la derecha) */}
      <div className={`flex justify-between items-center pt-2 border-t ${actionBorder} mt-4`}>
        <button
          onClick={() => onDelete && onDelete(id)}
          className={`text-gray-500 hover:text-white hover:bg-red-600 border border-transparent hover:border-red-600 px-3 py-1.5 rounded-md text-sm transition-all duration-200 flex items-center gap-1`}
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

export default ReportTechCard;

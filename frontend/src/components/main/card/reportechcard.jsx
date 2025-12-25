import React from "react";

const ReportTechCard = ({ report = {}, onView }) => {
  const { id, id_user, id_report, caso_tecnico, resolucion, tiempo, createdAt } = report;

  return (
    <article className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{caso_tecnico || `Caso #${id ?? "-"}`}</h3>
          <p className="mt-1 text-sm text-gray-600">{(resolucion || "Sin resolución").slice(0, 140)}</p>
          <div className="mt-2 text-xs text-gray-500">
            <span className="mr-3">{id_report ? `Reporte: ${id_report}` : null}</span>
            <span>{id_user ? `Técnico: ${id_user}` : null}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="text-xs text-gray-400">{tiempo ? `Tiempo: ${tiempo}` : "-"}</span>
          <span className="text-xs text-gray-400">{createdAt ? new Date(createdAt).toLocaleString() : "-"}</span>
          <button
            onClick={() => onView && onView(report)}
            className="mt-2 inline-block bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
          >
            Ver
          </button>
        </div>
      </div>
    </article>
  );
};

export default ReportTechCard;

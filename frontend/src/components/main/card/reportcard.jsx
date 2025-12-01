import React from "react";

const ReportCard = ({ report = {}, onView }) => {
	const {
		id,
		caso,
		descripcion,
		estado,
		fecha,
		area,
		nombre_natural,
	} = report;

	const statusColor = () => {
		switch ((estado || "").toLowerCase()) {
			case "abierto":
			case "open":
				return "bg-green-100 text-green-800";
			case "en proceso":
			case "in progress":
				return "bg-yellow-100 text-yellow-800";
			case "cerrado":
			case "closed":
				return "bg-gray-100 text-gray-800";
			case "urgente":
				return "bg-red-100 text-red-800";
			default:
				return "bg-blue-100 text-blue-800";
		}
	};

	return (
		<article className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h3 className="text-lg font-semibold text-gray-800">{caso || `Reporte #${id ?? "-"}`}</h3>
					<p className="mt-1 text-sm text-gray-600">{(descripcion || "Sin descripción").slice(0, 140)}</p>
					<div className="mt-2 text-xs text-gray-500">
						<span className="mr-3">{area ? `Área: ${area}` : null}</span>
						<span>{nombre_natural ? `Reportado por: ${nombre_natural}` : null}</span>
					</div>
				</div>

				<div className="flex flex-col items-end gap-2">
					<span className={`${statusColor()} px-3 py-1 rounded-full text-xs font-medium`}>{estado || "Sin estado"}</span>
					<span className="text-xs text-gray-400">{fecha ? new Date(fecha).toLocaleString() : "-"}</span>
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

export default ReportCard;

import React from "react";
import { FaUser, FaEnvelope, FaIdCard, FaPhoneAlt, FaTrash, FaEye, FaUserShield, FaUserCog } from "react-icons/fa";

const UserCard = ({ user = {}, onView, onDelete, darkMode = true }) => {
	const {
		id,
		nombre,
		apellido,
		correo,
		ficha,
		telefono,
		C_I,
		rol,
		extension
	} = user;

	// Colores dinámicos según el Rol
	const roleBadgeColor = () => {
		switch ((rol || "").toLowerCase()) {
			case "admin":
			case "administrador":
				return "bg-purple-100 text-purple-800 border-purple-200";
			case "tecnico":
			case "técnico":
				return "bg-blue-100 text-blue-800 border-blue-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const cardBg = darkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-200 text-gray-800";
	const secondaryText = darkMode ? "text-gray-400" : "text-gray-500";
	const actionBorder = darkMode ? "border-gray-700" : "border-gray-100";

	return (
		<article className={`${cardBg} rounded-xl shadow-md p-5 border flex flex-col h-full min-h-[240px] transition-all hover:shadow-lg`}>
			
			<div className="flex items-start justify-between gap-4 flex-1">
				<div className="flex-1">
					{/* Nombre y Apellido */}
					<h3 className="text-lg font-bold flex items-center gap-2 uppercase">
						<FaUser className="text-blue-500 text-sm shrink-0" />
						{nombre || "---"} {apellido || ""}
					</h3>
					
					{/* Correo */}
					<p className={`mt-1 text-sm flex items-center gap-2 truncate ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
						<FaEnvelope className="text-xs" />
						{correo || "Sin correo"}
					</p>

					{/* Metadata del Usuario (C.I y Ficha) */}
					<div className="mt-4 grid grid-cols-2 gap-2">
						<div className={`text-[11px] flex items-center gap-1 ${secondaryText}`}>
							<FaIdCard /> <strong>C.I:</strong> {C_I || "N/A"}
						</div>
						<div className={`text-[11px] flex items-center gap-1 ${secondaryText}`}>
							<FaIdCard /> <strong>Ficha:</strong> {ficha || "N/A"}
						</div>
					</div>

					{/* Contacto (Teléfono y Extensión) */}
					<div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
						<p className={`text-[11px] flex items-center gap-1 ${secondaryText}`}>
							<FaPhoneAlt size={10} /> <strong>Telf:</strong> {telefono || "N/A"}
						</p>
						{extension && (
							<p className={`text-[11px] flex items-center gap-1 ${secondaryText}`}>
								<FaPhoneAlt size={10} /> <strong>Ext:</strong> {extension}
							</p>
						)}
					</div>
				</div>

				{/* Badge de Rol en la esquina superior derecha */}
				<div className="flex flex-col items-end shrink-0">
					<span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${roleBadgeColor()}`}>
						{rol || "Usuario"}
					</span>
				</div>
			</div>

			{/* Fila de acciones fija en la parte inferior */}
			<div className={`flex justify-between items-center pt-4 mt-4 border-t ${actionBorder}`}>
				{/* Botón Eliminar (Lado Izquierdo) */}
				<button
					onClick={() => onDelete && onDelete(id)}
					className="group text-gray-500 hover:text-white hover:bg-red-600 border border-transparent hover:border-red-600 px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 flex items-center gap-2 uppercase"
				>
					<FaTrash size={12} className="group-hover:scale-110 transition-transform" />
					Eliminar
				</button>

				{/* Botón Ver (Lado Derecho) */}
				<button
					onClick={() => onView && onView(user)}
					className="bg-blue-600 text-white px-5 py-1.5 rounded-md hover:bg-blue-700 text-xs font-bold transition-colors shadow-sm flex items-center gap-2 uppercase tracking-tighter"
				>
					<FaEye size={14} />
					Ver detalles
				</button>
			</div>
		</article>
	);
};

export default UserCard;
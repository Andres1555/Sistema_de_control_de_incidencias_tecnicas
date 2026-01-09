import React, { useState } from "react";
import axios from "axios";

const UserForm = ({ initialData = {}, isEdit = false, readOnlyDefault = true, darkMode = true, onSuccess, onClose }) => {
    // Estado inicial con los campos del Schema de Users
    const [formData, setFormData] = useState({
        id: initialData.id || "",
        nombre: initialData.nombre || "",
        apellido: initialData.apellido || "",
        correo: initialData.correo || "",
        password: "", // La contraseña suele manejarse vacía por seguridad al editar
        ficha: initialData.ficha || "",
        telefono: initialData.telefono || "",
        C_I: initialData.C_I || "",
        rol: initialData.rol || "",
        extension: initialData.extension || ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const url = `http://localhost:8080/api/users/${formData.id}`;
            
            // Si el password está vacío, lo eliminamos del objeto para no sobreescribirlo por error
            const dataToSend = { ...formData };
            if (!dataToSend.password) delete dataToSend.password;

            await axios.put(url, dataToSend, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (onSuccess) onSuccess(); 
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            alert(error.response?.data?.message || "Error al guardar los cambios");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = `w-full p-2.5 rounded-lg border outline-none transition-all ${
        darkMode 
            ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" 
            : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-600"
    } ${readOnlyDefault ? "bg-transparent border-transparent cursor-default font-semibold text-lg" : "border-solid shadow-sm"}`;

    const labelClass = `block text-[10px] font-bold uppercase tracking-widest mb-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Nombre */}
                <div>
                    <label className={labelClass}>Nombre</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                </div>

                {/* Apellido */}
                <div>
                    <label className={labelClass}>Apellido</label>
                    <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                </div>

                {/* Cédula (C.I) */}
                <div>
                    <label className={labelClass}>Cédula de Identidad (C.I)</label>
                    <input type="number" name="C_I" value={formData.C_I} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                </div>

                {/* Correo Electrónico */}
                <div>
                    <label className={labelClass}>Correo Electrónico</label>
                    <input type="email" name="correo" value={formData.correo} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                </div>

                {/* Ficha */}
                <div>
                    <label className={labelClass}>Número de Ficha</label>
                    <input type="number" name="ficha" value={formData.ficha} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                </div>

                {/* Rol */}
                <div>
                    <label className={labelClass}>Rol / Cargo</label>
                    <input type="text" name="rol" value={formData.rol} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                </div>

                {/* Teléfono */}
                <div>
                    <label className={labelClass}>Teléfono</label>
                    <input type="number" name="telefono" value={formData.telefono} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                </div>

                {/* Extensión */}
                <div>
                    <label className={labelClass}>Extensión</label>
                    <input type="number" name="extension" value={formData.extension} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                </div>

                {/* Password (Solo visible en edición) */}
                {!readOnlyDefault && (
                    <div className="md:col-span-2">
                        <label className={labelClass}>Nueva Contraseña (dejar en blanco para no cambiar)</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} placeholder="********" />
                    </div>
                )}
            </div>

            {/* Botones de acción */}
            {!readOnlyDefault && (
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-700/30">
                    <button type="button" onClick={onClose} className={`px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-500/10 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-8 py-2 rounded-md font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95">
                        {isSubmitting ? "Actualizando..." : "Guardar Cambios"}
                    </button>
                </div>
            )}
        </form>
    );
};

export default UserForm;
import React, { useState } from "react";
import axios from "axios";

const WorkerForm = ({ initialData = {}, isEdit = false, readOnlyDefault = true, darkMode = true, onSuccess, onClose }) => {
    // Estado inicial con los campos del Schema de Sequelize
    const [formData, setFormData] = useState({
        id: initialData.id || "",
        ficha: initialData.ficha || "",
        nombres: initialData.nombres || "",
        apellidos: initialData.apellidos || "",
        anio_nac: initialData.anio_nac || "",
        mes_nac: initialData.mes_nac || "",
        dia_nac: initialData.dia_nac || "",
        dpto: initialData.dpto || "",
        gcia: initialData.gcia || ""
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
            const url = `http://localhost:8080/api/workers/${formData.id}`;
            
            // Enviar datos al backend
            await axios.put(url, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (onSuccess) onSuccess(); // Recarga la lista en el padre
        } catch (error) {
            console.error("Error al actualizar:", error);
            alert(error.response?.data?.message || "Error al guardar los cambios");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Estilos dinámicos
    const inputClass = `w-full p-2.5 rounded-lg border outline-none transition-all ${
        darkMode 
            ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" 
            : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-600"
    } ${readOnlyDefault ? "bg-transparent border-transparent cursor-default font-semibold text-lg" : "border-solid shadow-sm"}`;

    const labelClass = `block text-[10px] font-bold uppercase tracking-widest mb-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Sección Ficha */}
                <div>
                    <label className={labelClass}>Número de Ficha</label>
                    <input type="number" name="ficha" value={formData.ficha} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                </div>

                {/* Sección Nombres */}
                <div>
                    <label className={labelClass}>Nombres</label>
                    <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                </div>

                {/* Sección Apellidos */}
                <div>
                    <label className={labelClass}>Apellidos</label>
                    <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                </div>

                {/* Sección Gerencia */}
                <div>
                    <label className={labelClass}>Gerencia</label>
                    <input type="text" name="gcia" value={formData.gcia} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                </div>

                {/* Sección Departamento */}
                <div>
                    <label className={labelClass}>Departamento</label>
                    <input type="text" name="dpto" value={formData.dpto} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                </div>

                {/* Fecha de Nacimiento */}
                <div className="md:col-span-1">
                    <label className={labelClass}>Fecha de Nacimiento</label>
                    <div className="flex gap-2">
                        <input type="number" name="dia_nac" placeholder="DD" value={formData.dia_nac} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                        <input type="number" name="mes_nac" placeholder="MM" value={formData.mes_nac} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                        <input type="number" name="anio_nac" placeholder="AAAA" value={formData.anio_nac} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                    </div>
                </div>
            </div>

            {/* Botones de acción (Solo visibles si no es Solo Lectura) */}
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

export default WorkerForm;
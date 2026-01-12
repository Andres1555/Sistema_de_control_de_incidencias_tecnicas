import React, { useState } from "react";
import axios from "axios";

const WorkerForm = ({ initialData = {}, readOnlyDefault = false, darkMode = true, onSuccess, onClose }) => {
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
    const isCreate = !formData.id;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const url = isCreate 
                ? "http://localhost:8080/api/workers" 
                : `http://localhost:8080/api/workers/${formData.id}`;
            
            await axios({
                method: isCreate ? 'post' : 'put',
                url: url,
                data: formData,
                headers: { 'Authorization': `Bearer ${token}` }
            });

            alert(isCreate ? "Trabajador registrado" : "Trabajador actualizado");
            if (onSuccess) onSuccess(); 
        } catch (error) {
            alert(error.response?.data?.message || "Error en el servidor");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = `w-full p-2.5 rounded-lg border outline-none ${
        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
    } ${readOnlyDefault ? "bg-transparent border-transparent" : ""}`;

    const labelClass = `block text-[10px] font-bold uppercase mb-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className={labelClass}>Número de Ficha</label>
                    <input type="number" name="ficha" value={formData.ficha} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required />
                </div>
                <div>
                    <label className={labelClass}>Nombres</label>
                    <input type="text" name="nombres" value={formData.nombres} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required />
                </div>
                <div>
                    <label className={labelClass}>Apellidos</label>
                    <input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required />
                </div>
                <div>
                    <label className={labelClass}>Gerencia</label>
                    <input type="text" name="gcia" value={formData.gcia} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Departamento</label>
                    <input type="text" name="dpto" value={formData.dpto} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                </div>
                <div className="md:col-span-1">
                    <label className={labelClass}>Fecha de Nacimiento (DD/MM/AAAA)</label>
                    <div className="flex gap-2">
                        <input type="number" name="dia_nac" placeholder="DD" value={formData.dia_nac} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                        <input type="number" name="mes_nac" placeholder="MM" value={formData.mes_nac} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                        <input type="number" name="anio_nac" placeholder="AAAA" value={formData.anio_nac} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                    </div>
                </div>
            </div>

            {!readOnlyDefault && (
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-8 py-2 rounded-md font-bold">
                        {isSubmitting ? "Enviando..." : (isCreate ? "Registrar Trabajador" : "Guardar Cambios")}
                    </button>
                </div>
            )}
        </form>
    );
};

export default WorkerForm;
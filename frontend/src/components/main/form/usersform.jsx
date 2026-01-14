import React, { useState, useEffect } from "react";
import axios from "axios";

const UserForm = ({ initialData = {}, readOnlyDefault = false, darkMode = true, onSuccess, onClose }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        id: "",
        nombre: "",
        apellido: "",
        correo: "",
        password: "", 
        ficha: "",
        telefono: "",
        C_I: "",
        rol: "",
        extension: "",
        especializacion: "",
        nro_maquina: ""
    });

    const isCreate = !initialData.id;

    // --- SINCRONIZACIÓN DE DATOS (Para que aparezcan al pulsar Ver Detalles) ---
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            // 1. Extraer el número de máquina del objeto anidado que envía el backend
            const machineVal = initialData.Machines?.length > 0 
                ? initialData.Machines[0].nro_maquina 
                : (initialData.nro_maquina || "");

            // 2. Extraer los nombres de las especialidades y convertirlos a texto con comas
            const specsVal = initialData.Specializations?.length > 0
                ? initialData.Specializations.map(s => s.nombre).join(", ")
                : (initialData.especializacion || "");

            setFormData({
                id: initialData.id || "",
                nombre: initialData.nombre || "",
                apellido: initialData.apellido || "",
                correo: initialData.correo || initialData.email || "",
                password: "", 
                ficha: initialData.ficha || "",
                telefono: initialData.telefono || "",
                C_I: initialData.C_I || initialData.ci || "",
                rol: initialData.rol || "",
                extension: initialData.extension || "",
                especializacion: specsVal,
                nro_maquina: machineVal
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            const base = "http://localhost:8080/api";

            // --- MAPEAMOS LOS CAMPOS PARA EL BACKEND ---
            // Enviamos 'email' y 'ci' porque el controlador los espera así
            const userPayload = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                email: formData.correo,     // mapeo correo -> email
                ci: Number(formData.C_I),   // mapeo C_I -> ci
                password: formData.password,
                ficha: Number(formData.ficha),
                telefono: Number(formData.telefono),
                rol: formData.rol,
                extension: Number(formData.extension),
                especializacion: formData.especializacion, // Se envía como string, el service lo pica
                nro_maquina: formData.nro_maquina ? Number(formData.nro_maquina) : null
            };

            // Quitar password si está vacío en edición
            if (!isCreate && !userPayload.password) delete userPayload.password;

            if (isCreate) {
                await axios.post(`${base}/users`, userPayload, { headers });
            } else {
                // Usamos el CI para la ruta de actualización
                await axios.put(`${base}/users/${userPayload.ci}`, userPayload, { headers });
            }

            if (onSuccess) onSuccess(); 
            onClose();

        } catch (error) {
            console.error("Error completo:", error);
            alert(error.response?.data?.message || "Error al procesar los datos");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Estilos dinámicos
    const inputClass = `w-full p-2.5 rounded-lg border outline-none transition-all ${
        darkMode 
            ? "bg-[#334155] border-slate-600 text-white focus:border-blue-500" 
            : "bg-white border-gray-300 text-black focus:border-blue-600"
    } ${readOnlyDefault ? "bg-transparent border-transparent cursor-default font-bold text-lg" : "border-solid shadow-sm"}`;

    const labelClass = `block text-[10px] font-bold uppercase tracking-widest mb-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`;

    return (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelClass}>Nombre</label><input type="text" name="nombre" value={formData.nombre} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                <div><label className={labelClass}>Apellido</label><input type="text" name="apellido" value={formData.apellido} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                <div><label className={labelClass}>Cédula (C.I)</label><input type="number" name="C_I" value={formData.C_I} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                <div><label className={labelClass}>Correo</label><input type="email" name="correo" value={formData.correo} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                
                <div className="md:col-span-2">
                    <label className={labelClass}>Especializaciones</label>
                    <input type="text" name="especializacion" value={formData.especializacion} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} placeholder="redes, sql, soporte" />
                </div>

                <div><label className={labelClass}>Nro Máquina Asignada</label><input type="number" name="nro_maquina" value={formData.nro_maquina} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} /></div>
                
                <div>
                    <label className={labelClass}>Rol</label>
                    <select name="rol" value={formData.rol} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required>
                        <option value="">Seleccione...</option>
                        <option value="tecnico">Técnico</option>
                        <option value="administrador">Administrador</option>
                    </select>
                </div>

                <div><label className={labelClass}>Ficha</label><input type="number" name="ficha" value={formData.ficha} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className={labelClass}>Teléfono</label>
                        <input type="number" name="telefono" value={formData.telefono} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required />
                    </div>
                    <div className="flex-1">
                        <label className={labelClass}>Extensión</label>
                        <input type="number" name="extension" value={formData.extension} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required />
                    </div>
                </div>

                {!readOnlyDefault && isCreate && (
                    <div className="md:col-span-2">
                        <label className={labelClass}>Contraseña</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} required={isCreate} placeholder="••••••••" />
                    </div>
                )}
            </div>

            {!readOnlyDefault && (
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-700/30">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500 hover:text-white transition-colors">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-8 py-2 rounded-md font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all">
                        {isSubmitting ? "Procesando..." : (isCreate ? "Registrar Usuario" : "Guardar Cambios")}
                    </button>
                </div>
            )}
        </form>
    );
};

export default UserForm;
import React, { useState, useEffect } from "react";
import axios from "axios";

const UserForm = ({ initialData = {}, readOnlyDefault = false, darkMode = true, onSuccess, onClose }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Inicializamos el estado. Si hay datos iniciales, unimos las especialidades con comas para el input.
    const [formData, setFormData] = useState({
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
        especializacion: initialData.Specializations 
            ? initialData.Specializations.map(s => s.nombre).join(", ") 
            : "",
        nro_maquina: initialData.Machines ? initialData.Machines[0]?.nro_maquina : ""
    });

    const isCreate = !formData.id;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. Procesar especialidades (convertir string a array)
        const listaSpecs = formData.especializacion
            .split(",")
            .map(s => s.trim())
            .filter(s => s !== "");

        if (listaSpecs.length === 0) {
            alert("Debe ingresar al menos una especialidad (ej: redes, sql)");
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            const base = "http://localhost:8080/api";

            // 2. Mapeo de payload para el controlador de usuarios
            const userPayload = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                email: formData.correo,
                ci: Number(formData.C_I),
                password: formData.password,
                ficha: Number(formData.ficha),
                telefono: Number(formData.telefono),
                rol: formData.rol,
                extension: Number(formData.extension)
            };

            // En edición, si el password está vacío, no lo enviamos
            if (!isCreate && !userPayload.password) delete userPayload.password;

            // 3. Crear o Actualizar Usuario
            let userId = formData.id;
            if (isCreate) {
                const resUser = await axios.post(`${base}/users`, userPayload, { headers });
                // Captura de ID robusta
                userId = resUser.data?.id || resUser.data?.user?.id || resUser.data?.data?.id;
            } else {
                await axios.put(`${base}/users/${userId}`, userPayload, { headers });
            }

            if (!userId) throw new Error("No se pudo obtener el ID del usuario");

            // 4. Crear/Actualizar Máquina (Opcional)
            if (formData.nro_maquina) {
                try {
                    await axios.post(`${base}/machines`, { 
                        id_user: Number(userId), 
                        nro_maquina: Number(formData.nro_maquina) 
                    }, { headers });
                } catch (err) { console.warn("Error en máquinas:", err); }
            }

            // 5. PROCESAR CADA ESPECIALIZACIÓN POR SEPARADO
            for (const nombreSpec of listaSpecs) {
                try {
                    // Buscar o crear especialidad
                    const specRes = await axios.post(`${base}/specializations`, { nombre: nombreSpec }, { headers });
                    const specId = specRes.data?.id || specRes.data?.data?.id;

                    if (specId) {
                        // Vincular en tabla intermedia specialization_users
                        await axios.post(`${base}/specialization_users`, { 
                            id_user: Number(userId), 
                            id_specia: Number(specId) 
                        }, { headers });
                    }
                } catch (err) { console.warn(`Error con especialidad ${nombreSpec}:`, err); }
            }

            alert(isCreate ? "Usuario creado exitosamente" : "Usuario actualizado");
            if (onSuccess) onSuccess(); 
            onClose();

        } catch (error) {
            console.error("Error completo:", error);
            alert(error.response?.data?.message || "Error al procesar el usuario");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = `w-full p-2.5 rounded-lg border outline-none transition-all ${
        darkMode ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500" : "bg-white border-gray-300 text-black focus:border-blue-600"
    } ${readOnlyDefault ? "bg-transparent border-transparent cursor-default font-bold" : "border-solid shadow-sm"}`;

    const labelClass = `block text-[10px] font-bold uppercase tracking-widest mb-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`;

    return (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className={labelClass}>Nombre</label><input type="text" name="nombre" value={formData.nombre} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                <div><label className={labelClass}>Apellido</label><input type="text" name="apellido" value={formData.apellido} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                <div><label className={labelClass}>Cédula</label><input type="number" name="C_I" value={formData.C_I} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                <div><label className={labelClass}>Correo</label><input type="email" name="correo" value={formData.correo} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                
                <div className="md:col-span-2">
                    <label className={labelClass}>Especializaciones (separadas por comas)</label>
                    <input type="text" name="especializacion" value={formData.especializacion} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} placeholder="redes, sql, soporte" required />
                </div>

                <div><label className={labelClass}>Nro Máquina</label><input type="number" name="nro_maquina" value={formData.nro_maquina} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} /></div>
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

                {!readOnlyDefault && (
                    <div className="md:col-span-2">
                        <label className={labelClass}>Contraseña</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} required={isCreate} placeholder={isCreate ? "••••••••" : "Vacío para no cambiar"} />
                    </div>
                )}
            </div>

            {!readOnlyDefault && (
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-700/30">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-8 py-2 rounded-md font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95">
                        {isSubmitting ? "Procesando..." : (isCreate ? "Registrar Usuario" : "Guardar Cambios")}
                    </button>
                </div>
            )}
        </form>
    );
};

export default UserForm;
import React, { useState, useEffect } from "react";
import axios from "axios";

const UserForm = ({ initialData = {}, readOnlyDefault = false, darkMode = true, onSuccess, onClose }) => {
    const [availableSpecs, setAvailableSpecs] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        id: initialData.id || "",
        nombre: initialData.nombre || "",
        apellido: initialData.apellido || "",
        correo: initialData.correo || initialData.email || "",
        password: "", 
        ficha: initialData.ficha || "",
        telefono: initialData.telefono || "", // Campo obligatorio en el backend
        C_I: initialData.C_I || initialData.ci || "", // Campo obligatorio en el backend
        rol: initialData.rol || "",
        extension: initialData.extension || "", // Campo obligatorio en el backend
        nro_maquina: initialData.Machines ? initialData.Machines[0]?.nro_maquina : "",
        id_especializacion: initialData.Specializations ? initialData.Specializations[0]?.id : ""
    });

    const isCreate = !formData.id;

    useEffect(() => {
        const fetchSpecs = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/specializations");
                setAvailableSpecs(res.data);
            } catch (err) { console.error("Error specs", err); }
        };
        fetchSpecs();
    }, []);

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

            // 1. Payload para /api/users (Debe tener TODOS los campos obligatorios)
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

            // Evitar enviar password vacío en edición
            if (!isCreate && !userPayload.password) delete userPayload.password;

            let userId = formData.id;
            
            if (isCreate) {
                // Crear Usuario
                const resUser = await axios.post(`${base}/users`, userPayload, { headers });
                userId = resUser.data.user?.id || resUser.data.data?.id;
            } else {
                // Actualizar Usuario
                await axios.put(`${base}/users/${formData.id}`, userPayload, { headers });
            }

            // 2. Crear Máquina (Si se puso número)
            if (formData.nro_maquina && userId) {
                await axios.post(`${base}/machines`, {
                    id_user: userId,
                    nro_maquina: Number(formData.nro_maquina)
                }, { headers });
            }

            // 3. Crear Especialización (Tabla Intermedia)
            if (formData.id_especializacion && userId) {
                await axios.post(`${base}/specialization_users`, {
                    id_user: userId,
                    id_specia: Number(formData.id_especializacion)
                }, { headers });
            }

            if (onSuccess) onSuccess(); 
            onClose();

        } catch (error) {
            console.error("Error completo:", error.response?.data);
            alert(error.response?.data?.message || "Faltan campos obligatorios o hay un error en los datos");
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
                <div>
                    <label className={labelClass}>Nombre</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required />
                </div>
                <div>
                    <label className={labelClass}>Apellido</label>
                    <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required />
                </div>
                <div>
                    <label className={labelClass}>Cédula (C.I)</label>
                    <input type="number" name="C_I" value={formData.C_I} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required />
                </div>
                <div>
                    <label className={labelClass}>Correo Electrónico</label>
                    <input type="email" name="correo" value={formData.correo} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required />
                </div>
                <div>
                    <label className={labelClass}>Nro Máquina Asignada</label>
                    <input type="number" name="nro_maquina" value={formData.nro_maquina} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} />
                </div>
                <div>
                    <label className={labelClass}>Especialidad Principal</label>
                    <select name="id_especializacion" value={formData.id_especializacion} onChange={handleChange} disabled={readOnlyDefault} className={inputClass}>
                        <option value="">Seleccione...</option>
                        {availableSpecs.map(spec => <option key={spec.id} value={spec.id}>{spec.nombre}</option>)}
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Rol / Cargo</label>
                    <select name="rol" value={formData.rol} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required>
                        <option value="">Seleccione...</option>
                        <option value="tecnico">Técnico</option>
                        <option value="administrador">Administrador</option>
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Ficha</label>
                    <input type="number" name="ficha" value={formData.ficha} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required />
                </div>
                
                {/* --- CAMPOS QUE FALTABAN --- */}
                <div>
                    <label className={labelClass}>Teléfono</label>
                    <input type="number" name="telefono" value={formData.telefono} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required />
                </div>
                <div>
                    <label className={labelClass}>Extensión</label>
                    <input type="number" name="extension" value={formData.extension} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required />
                </div>

                {!readOnlyDefault && (
                    <div className="md:col-span-2">
                        <label className={labelClass}>Contraseña</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} required={isCreate} placeholder={isCreate ? "••••••••" : "Vacío para no cambiar"} />
                    </div>
                )}
            </div>

            {!readOnlyDefault && (
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/30">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-gray-500">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-8 py-2 rounded-md font-bold shadow-lg hover:bg-blue-700">
                        {isSubmitting ? "Procesando..." : (isCreate ? "Registrar Usuario" : "Guardar Cambios")}
                    </button>
                </div>
            )}
        </form>
    );
};

export default UserForm;
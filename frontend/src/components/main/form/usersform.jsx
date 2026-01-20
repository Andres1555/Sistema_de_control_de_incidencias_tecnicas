import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaSave, FaUserPlus } from "react-icons/fa"; 
import LoadingModal from "@/hooks/Modals/LoadingModal"; 

const UserForm = ({ initialData = {}, readOnlyDefault = false, darkMode = true, onSuccess, onClose }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Estado para guardar el CI original y no perder la referencia al editar
    const [originalCI, setOriginalCI] = useState(null);
    
    const [modalState, setModalState] = useState({
        isOpen: false,
        status: "loading",
        message: "",
    });

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

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            const machineVal = initialData.Machines?.length > 0 
                ? initialData.Machines[0].nro_maquina 
                : (initialData.nro_maquina || "");

            const specsVal = initialData.Specializations?.length > 0
                ? initialData.Specializations.map(s => s.nombre).join(", ")
                : (initialData.especializacion || "");

            const ciValue = initialData.C_I || initialData.ci || "";
            setOriginalCI(ciValue); // Guardamos la referencia original

            setFormData({
                id: initialData.id || "",
                nombre: initialData.nombre || "",
                apellido: initialData.apellido || "",
                correo: initialData.correo || initialData.email || "",
                password: "", 
                ficha: initialData.ficha || "",
                telefono: initialData.telefono || "",
                C_I: ciValue,
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

        setModalState({
            isOpen: true,
            status: "loading",
            message: isCreate ? "Registrando nuevo usuario..." : "Guardando cambios..."
        });

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            const base = "http://localhost:8080/api";

            const userPayload = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                email: formData.correo,
                ci: Number(formData.C_I), // Este es el valor nuevo
                password: formData.password,
                ficha: Number(formData.ficha),
                telefono: Number(formData.telefono),
                rol: formData.rol,
                extension: Number(formData.extension),
                especializacion: formData.especializacion,
                nro_maquina: formData.nro_maquina ? Number(formData.nro_maquina) : null
            };

            if (!isCreate && !userPayload.password) delete userPayload.password;

            if (isCreate) {
                await axios.post(`${base}/users`, userPayload, { headers });
            } else {
                // USAMOS originalCI para la URL de búsqueda en el backend
                await axios.put(`${base}/users/${originalCI}`, userPayload, { headers });
            }

            setModalState({
                isOpen: true,
                status: "success",
                message: isCreate ? "Usuario registrado exitosamente" : "Usuario actualizado correctamente"
            });

        } catch (error) {
            setModalState({
                isOpen: true,
                status: "error",
                message: error.response?.data?.message || "Ocurrió un problema en el servidor"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModalClose = () => {
        const wasSuccess = modalState.status === "success";
        setModalState(prev => ({ ...prev, isOpen: false }));
        if (wasSuccess) {
            if (onSuccess) onSuccess(); 
            onClose();
        }
    };

    const inputClass = `w-full p-2.5 rounded-xl border outline-none transition-all font-bold ${
        darkMode ? "bg-[#334155] border-slate-600 text-white" : "bg-white border-gray-300 text-black"
    } ${readOnlyDefault ? "bg-transparent border-transparent cursor-default font-black" : "border-solid"}`;

    const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`;

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelClass}>Nombre</label><input type="text" name="nombre" value={formData.nombre} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                    <div><label className={labelClass}>Apellido</label><input type="text" name="apellido" value={formData.apellido} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                    <div><label className={labelClass}>Cédula (C.I)</label><input type="number" name="C_I" value={formData.C_I} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                    <div><label className={labelClass}>Correo</label><input type="email" name="correo" value={formData.correo} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                    <div className="md:col-span-2"><label className={labelClass}>Especializaciones</label><input type="text" name="especializacion" value={formData.especializacion} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} /></div>
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
                        <div className="flex-1"><label className={labelClass}>Teléfono</label><input type="number" name="telefono" value={formData.telefono} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                        <div className="flex-1"><label className={labelClass}>Extensión</label><input type="number" name="extension" value={formData.extension} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                    </div>
                    {!readOnlyDefault && isCreate && (
                        <div className="md:col-span-2"><label className={labelClass}>Contraseña</label><input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} required={isCreate} placeholder="••••••••" /></div>
                    )}
                </div>
                {!readOnlyDefault && (
                    <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t border-gray-700/30">
                        <button type="button" onClick={onClose} className="flex-1 md:flex-none h-11 px-8 rounded-xl text-red-500 border-2 border-red-600 uppercase font-black tracking-widest hover:bg-red-600 hover:text-white transition-all"><FaTrash className="inline mr-2"/> Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 md:flex-none h-11 px-10 rounded-xl bg-blue-600 text-white uppercase font-black tracking-widest hover:bg-blue-700 transition-all shadow-lg">{isCreate ? <FaUserPlus className="inline mr-2"/> : <FaSave className="inline mr-2"/>} {isSubmitting ? "Procesando..." : (isCreate ? "Registrar" : "Guardar")}</button>
                    </div>
                )}
            </form>
            <LoadingModal isOpen={modalState.isOpen} status={modalState.status} message={modalState.message} onClose={handleModalClose} />
        </>
    );
};

export default UserForm;
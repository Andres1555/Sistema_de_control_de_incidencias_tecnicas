import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaSave, FaUserPlus, FaLock, FaUser, FaIdCard, FaEnvelope, FaPhone, FaBuilding, FaDesktop, FaTags, FaClipboardList } from "react-icons/fa"; 
import LoadingModal from "@/hooks/Modals/LoadingModal"; 

const UserForm = ({ initialData = {}, readOnlyDefault = false, darkMode = true, onSuccess, onClose }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [originalCI, setOriginalCI] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
    
    const [modalState, setModalState] = useState({
        isOpen: false, status: "loading", message: "",
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
        nro_maquina: "",
        area: ""
    });

    const isCreate = !initialData.id;

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            const machineVal = initialData.Machines?.length > 0 ? initialData.Machines[0].nro_maquina : (initialData.nro_maquina || "");
            const specsVal = initialData.Specializations?.length > 0 ? initialData.Specializations.map(s => s.nombre).join(", ") : (initialData.especializacion || "");
            const ciValue = initialData.C_I || initialData.ci || "";
            setOriginalCI(ciValue);
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
                nro_maquina: machineVal,
                area: initialData.area || ""
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setModalState({ isOpen: true, status: "loading", message: isCreate ? "Registrando nuevo usuario..." : "Guardando cambios..." });
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            const base = `${API_URL}/api`;

            const userPayload = {
                nombre: formData.nombre,
                apellido: formData.apellido,
                email: formData.correo,
                ci: Number(formData.C_I),
                password: formData.password,
                ficha: Number(formData.ficha),
                telefono: String(formData.telefono),
                rol: formData.rol,
                extension: Number(formData.extension),
                especializacion: formData.especializacion,
                nro_maquina: formData.nro_maquina ? String(formData.nro_maquina) : null,
                area: formData.area
            };

            
            if (!isCreate && !userPayload.password) delete userPayload.password;

            if (isCreate) {
                await axios.post(`${base}/users`, userPayload, { headers });
            } else {
                await axios.put(`${base}/users/${originalCI}`, userPayload, { headers });
            }

            setModalState({ isOpen: true, status: "success", message: isCreate ? "Usuario registrado exitosamente" : "Usuario actualizado correctamente" });
        } catch (error) {
            setModalState({ isOpen: true, status: "error", message: error.response?.data?.message || "Ocurrió un problema en el servidor" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModalClose = () => {
        const wasSuccess = modalState.status === "success";
        setModalState(prev => ({ ...prev, isOpen: false }));
        if (wasSuccess) { if (onSuccess) onSuccess(); onClose(); }
    };

    const inputClass = `w-full p-2.5 rounded-xl border outline-none transition-all font-bold ${darkMode ? "bg-[#334155] border-slate-600 text-white focus:border-blue-500" : "bg-white border-gray-300 text-black focus:border-blue-600"} ${readOnlyDefault ? "bg-transparent border-transparent cursor-default font-black text-lg" : "border-solid shadow-sm"}`;

    const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`;

    return (
        <>
            {readOnlyDefault ? (
                <div className="space-y-6 animate-fade-in p-6 md:p-8">
                    {/* Header/Title block */}
                    <div className={`p-6 rounded-2xl border transition-all ${
                        darkMode ? "bg-slate-800/40 border-slate-700/50" : "bg-gray-50 border-gray-200"
                    }`}>
                        <div className="flex items-center gap-2 mb-2">
                            <FaClipboardList className={darkMode ? "text-blue-400" : "text-blue-600"} size={16} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                                Ficha de Usuario
                            </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black leading-tight">
                            {formData.nombre} {formData.apellido}
                        </h2>
                        <div className="flex flex-wrap gap-2 mt-4">
                            <span className={`px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                                formData.rol?.toLowerCase() === 'administrador' 
                                    ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                    : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            }`}>
                                Rol: {formData.rol || 'No definido'}
                            </span>
                            {formData.area && (
                                <span className={`px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                                    darkMode ? 'bg-slate-700/50 text-slate-300 border border-slate-600/30' : 'bg-white text-gray-700 border border-gray-200 shadow-sm'
                                }`}>
                                    <FaBuilding size={10} /> Área: {formData.area}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Grid for Technical Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Card 1: Contact details */}
                        <div className={`p-6 rounded-2xl border ${
                            darkMode ? "bg-slate-800/20 border-slate-700/30" : "bg-white border-gray-200/60 shadow-sm"
                        } space-y-4`}>
                            <h3 className={`text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b ${
                                darkMode ? "text-slate-400 border-slate-700/40" : "text-slate-500 border-gray-100"
                            }`}>
                                <FaUser size={14} className={darkMode ? "text-blue-400" : "text-blue-600"} /> Datos Personales y de Contacto
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <FaIdCard size={9} /> Cédula (C.I)
                                    </span>
                                    <span className={`text-sm font-black mt-1 block ${darkMode ? "text-white" : "text-slate-900"}`}>
                                        {formData.C_I || "N/A"}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Nº Ficha</span>
                                    <span className={`text-sm font-black mt-1 block ${darkMode ? "text-white" : "text-slate-900"}`}>
                                        {formData.ficha || "N/A"}
                                    </span>
                                </div>
                                <div className="col-span-2 pt-1">
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <FaEnvelope size={10} /> Correo Electrónico
                                    </span>
                                    <span className={`text-sm font-black mt-1 block truncate ${darkMode ? "text-white" : "text-slate-900"}`}>
                                        {formData.correo || "N/A"}
                                    </span>
                                </div>
                                <div className="pt-1">
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <FaPhone size={10} /> Teléfono
                                    </span>
                                    <span className={`text-sm font-black mt-1 block ${darkMode ? "text-white" : "text-slate-900"}`}>
                                        {formData.telefono || "N/A"}
                                    </span>
                                </div>
                                <div className="pt-1">
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Extensión</span>
                                    <span className={`text-sm font-black mt-1 block ${darkMode ? "text-white" : "text-slate-900"}`}>
                                        {formData.extension || "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Workspace details */}
                        <div className={`p-6 rounded-2xl border ${
                            darkMode ? "bg-slate-800/20 border-slate-700/30" : "bg-white border-gray-200/60 shadow-sm"
                        } space-y-4`}>
                            <h3 className={`text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b ${
                                darkMode ? "text-slate-400 border-slate-700/40" : "text-slate-500 border-gray-100"
                            }`}>
                                <FaDesktop size={14} className={darkMode ? "text-blue-400" : "text-blue-600"} /> Asignación y Capacidades
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Número de Máquina Asignada</span>
                                    <span className={`text-base font-black mt-1 block ${darkMode ? "text-white" : "text-slate-900"}`}>
                                        {formData.nro_maquina || "Ninguna"}
                                    </span>
                                </div>
                                
                                <div>
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <FaTags size={10} /> Especializaciones
                                    </span>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {formData.especializacion ? (
                                            formData.especializacion.split(',').map((spec, i) => (
                                                <span key={i} className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                                                    darkMode ? "bg-slate-700 text-slate-300 border border-slate-600/30" : "bg-gray-100 text-gray-700 border border-gray-200"
                                                }`}>
                                                    {spec.trim()}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Ninguna especialización registrada</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in p-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className={labelClass}>Nombre</label><input type="text" name="nombre" value={formData.nombre} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                        <div><label className={labelClass}>Apellido</label><input type="text" name="apellido" value={formData.apellido} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                        <div><label className={labelClass}>Cédula (C.I)</label><input type="number" name="C_I" value={formData.C_I} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                        <div><label className={labelClass}>Correo</label><input type="email" name="correo" value={formData.correo} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                        
                        <div className="md:col-span-2">
                            <label className={labelClass}>Especializaciones</label>
                            <input type="text" name="especializacion" value={formData.especializacion} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} placeholder="redes, sql, soporte" />
                        </div>

                        <div><label className={labelClass}>Nro Máquina</label><input type="text" name="nro_maquina" value={formData.nro_maquina} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} /></div>
                        
                        <div>
                            <label className={labelClass}>Rol</label>
                            <select name="rol" value={formData.rol} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required>
                                <option value="">Seleccione...</option>
                                <option value="tecnico">Técnico</option>
                                <option value="administrador">Administrador</option>
                            </select>
                        </div>

                        <div><label className={labelClass}>Área</label><input type="text" name="area" value={formData.area} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} /></div>

                        {!readOnlyDefault && (
                            <div className="md:col-span-2">
                                <label className={labelClass}><FaLock className="inline mb-1 mr-1"/> {isCreate ? "Contraseña" : "Cambiar Contraseña (opcional)"}</label>
                                <input 
                                    type="password" 
                                    name="password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    className={inputClass} 
                                    required={isCreate} 
                                    placeholder="••••••••" 
                                />
                            </div>
                        )}

                        <div><label className={labelClass}>Ficha</label><input type="number" name="ficha" value={formData.ficha} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                        
                        <div className="flex gap-2">
                            <div className="flex-1"><label className={labelClass}>Teléfono</label><input type="number" name="telefono" value={formData.telefono} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                            <div className="flex-1"><label className={labelClass}>Extensión</label><input type="number" name="extension" value={formData.extension} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                        </div>
                    </div>

                    {!readOnlyDefault && (
                        <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t border-gray-700/30">
                            <button type="button" onClick={onClose} className={`flex-1 md:flex-none h-11 px-8 rounded-xl text-red-500 border-2 border-red-600 uppercase font-black tracking-widest hover:bg-red-600 hover:text-white transition-all`}><FaTrash size={12} className="inline mr-2" /> Cancelar</button>
                            <button type="submit" disabled={isSubmitting} className={`flex-1 md:flex-none h-11 px-10 rounded-xl bg-blue-600 text-white uppercase font-black tracking-widest hover:bg-blue-700 transition-all shadow-lg`}>{isCreate ? <FaUserPlus size={14} /> : <FaSave size={14} />} {isSubmitting ? "Procesando..." : (isCreate ? "Registrar" : "Guardar")}</button>
                        </div>
                    )}
                </form>
            )}
            <LoadingModal isOpen={modalState.isOpen} status={modalState.status} message={modalState.message} onClose={handleModalClose} />
        </>
    );
};

export default UserForm;
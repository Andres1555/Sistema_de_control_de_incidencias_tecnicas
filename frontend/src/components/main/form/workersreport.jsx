import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaSave, FaUserPlus, FaUser, FaBuilding, FaIdCard, FaClipboardList, FaCalendarAlt } from "react-icons/fa"; 
import LoadingModal from "@/hooks/Modals/LoadingModal";

const WorkerForm = ({ initialData = {}, readOnlyDefault = false, darkMode = true, onSuccess, onClose }) => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
    
    const [formData, setFormData] = useState({
        id: "", ficha: "", nombres: "", apellidos: "", anio_nac: "", mes_nac: "", dia_nac: "", dpto: "", gcia: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalState, setModalState] = useState({ isOpen: false, status: "loading", message: "" });
    const isCreate = !formData.id;

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData({
                id: initialData.id || "", ficha: initialData.ficha || "", nombres: initialData.nombres || "", apellidos: initialData.apellidos || "", anio_nac: initialData.anio_nac || "", mes_nac: initialData.mes_nac || "", dia_nac: initialData.dia_nac || "", dpto: initialData.dpto || "", gcia: initialData.gcia || ""
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setModalState({ isOpen: true, status: "loading", message: isCreate ? "Registrando trabajador..." : "Actualizando información..." });
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            // URL DINÁMICA
            const url = isCreate ? `${API_URL}/api/workers` : `${API_URL}/api/workers/${formData.id}`;
            
            await axios({
                method: isCreate ? 'post' : 'put',
                url: url,
                data: formData,
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setModalState({ isOpen: true, status: "success", message: isCreate ? "Trabajador registrado exitosamente" : "Información actualizada correctamente" });
        } catch (error) {
            setModalState({ isOpen: true, status: "error", message: error.response?.data?.message || "Error al procesar la solicitud" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModalClose = () => {
        const wasSuccess = modalState.status === "success";
        setModalState(prev => ({ ...prev, isOpen: false }));
        if (wasSuccess) { if (onSuccess) onSuccess(); if (onClose) onClose(); }
    };

    const inputClass = `w-full p-2.5 rounded-xl border outline-none transition-all font-bold ${
        darkMode ? "bg-[#334155] border-slate-600 text-white focus:border-blue-500" : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-600"
    } ${readOnlyDefault ? "bg-transparent border-transparent cursor-default font-black text-lg" : "border-solid shadow-sm"}`;

    const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`;

    return (
        <>
            {readOnlyDefault ? (
                <div className="space-y-6 animate-fade-in p-6 md:p-8">
                    <div className={`p-6 rounded-2xl border transition-all ${
                        darkMode ? "bg-slate-800/40 border-slate-700/50" : "bg-gray-50 border-gray-200"
                    }`}>
                        <div className="flex items-center gap-2 mb-2">
                            <FaClipboardList className={darkMode ? "text-blue-400" : "text-blue-600"} size={16} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                                Ficha de Trabajador
                            </span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black leading-tight">
                            {formData.nombres} {formData.apellidos}
                        </h2>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {formData.gcia && (
                                <span className={`px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                                    darkMode ? 'bg-slate-700/50 text-slate-300 border border-slate-600/30' : 'bg-white text-gray-700 border border-gray-200 shadow-sm'
                                }`}>
                                    <FaBuilding size={10} /> Gerencia: {formData.gcia}
                                </span>
                            )}
                            {formData.dpto && (
                                <span className={`px-3.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                                    darkMode ? 'bg-slate-700/50 text-slate-300 border border-slate-600/30' : 'bg-white text-gray-700 border border-gray-200 shadow-sm'
                                }`}>
                                    <FaBuilding size={10} /> Dpto: {formData.dpto}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={`p-6 rounded-2xl border ${
                            darkMode ? "bg-slate-800/20 border-slate-700/30" : "bg-white border-gray-200/60 shadow-sm"
                        } space-y-4`}>
                            <h3 className={`text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b ${
                                darkMode ? "text-slate-400 border-slate-700/40" : "text-slate-500 border-gray-100"
                            }`}>
                                <FaUser size={14} className={darkMode ? "text-blue-400" : "text-blue-600"} /> Datos Personales
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                        <FaIdCard size={9} /> Nº Ficha
                                    </span>
                                    <span className={`text-sm font-black mt-1 block ${darkMode ? "text-white" : "text-slate-900"}`}>
                                        {formData.ficha || "N/A"}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <FaCalendarAlt size={9} className="inline mr-1" /> Fecha de Nacimiento
                                    </span>
                                    <span className={`text-sm font-black mt-1 block ${darkMode ? "text-white" : "text-slate-900"}`}>
                                        {formData.dia_nac && formData.mes_nac && formData.anio_nac
                                            ? `${formData.dia_nac}/${formData.mes_nac}/${formData.anio_nac}`
                                            : "No registrada"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={`p-6 rounded-2xl border ${
                            darkMode ? "bg-slate-800/20 border-slate-700/30" : "bg-white border-gray-200/60 shadow-sm"
                        } space-y-4`}>
                            <h3 className={`text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2 pb-2 border-b ${
                                darkMode ? "text-slate-400 border-slate-700/40" : "text-slate-500 border-gray-100"
                            }`}>
                                <FaBuilding size={14} className={darkMode ? "text-blue-400" : "text-blue-600"} /> Asignaci&oacute;n Laboral
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Gerencia</span>
                                    <span className={`text-sm font-black mt-1 block ${darkMode ? "text-white" : "text-slate-900"}`}>
                                        {formData.gcia || "N/A"}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Departamento</span>
                                    <span className={`text-sm font-black mt-1 block ${darkMode ? "text-white" : "text-slate-900"}`}>
                                        {formData.dpto || "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in p-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className={labelClass}>Número de Ficha</label><input type="number" name="ficha" value={formData.ficha} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                        <div><label className={labelClass}>Nombres</label><input type="text" name="nombres" value={formData.nombres} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                        <div><label className={labelClass}>Apellidos</label><input type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} required /></div>
                        <div><label className={labelClass}>Gerencia</label><input type="text" name="gcia" value={formData.gcia} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} /></div>
                        <div><label className={labelClass}>Departamento</label><input type="text" name="dpto" value={formData.dpto} onChange={handleChange} disabled={readOnlyDefault} className={inputClass} /></div>
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
                        <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t border-gray-700/30">
                            <button type="button" onClick={onClose} className={`flex-1 md:flex-none h-11 px-8 rounded-xl text-red-500 border-2 border-red-600 uppercase font-black tracking-widest hover:bg-red-600 hover:text-white transition-all`}><FaTrash size={12} className="inline mr-2" /> Cancelar</button>
                            <button type="submit" disabled={isSubmitting} className={`flex-1 md:flex-none h-11 px-10 rounded-xl bg-blue-600 text-white uppercase font-black tracking-widest hover:bg-blue-700 transition-all shadow-md`}>{isCreate ? <FaUserPlus size={14} /> : <FaSave size={14} />} {isSubmitting ? "Procesando..." : (isCreate ? "Registrar" : "Guardar")}</button>
                        </div>
                    )}
                </form>
            )}
            <LoadingModal isOpen={modalState.isOpen} status={modalState.status} message={modalState.message} onClose={handleModalClose} />
        </>
    );
};

export default WorkerForm;
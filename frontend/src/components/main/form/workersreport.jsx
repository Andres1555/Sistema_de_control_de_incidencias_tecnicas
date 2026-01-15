import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTrash, FaSave, FaUserPlus } from "react-icons/fa"; // Iconos para consistencia
import LoadingModal from "@/hooks/Modals/LoadingModal";

const WorkerForm = ({ initialData = {}, readOnlyDefault = false, darkMode = true, onSuccess, onClose }) => {
    const [formData, setFormData] = useState({
        id: "",
        ficha: "",
        nombres: "",
        apellidos: "",
        anio_nac: "",
        mes_nac: "",
        dia_nac: "",
        dpto: "",
        gcia: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [modalState, setModalState] = useState({
        isOpen: false,
        status: "loading",
        message: "",
    });

    const isCreate = !formData.id;

    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData({
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
            message: isCreate ? "Registrando trabajador..." : "Actualizando información..."
        });

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

            setModalState({
                isOpen: true,
                status: "success",
                message: isCreate ? "Trabajador registrado exitosamente" : "Información actualizada correctamente"
            });

        } catch (error) {
            console.error("Error:", error);
            setModalState({
                isOpen: true,
                status: "error",
                message: error.response?.data?.message || "Error al procesar la solicitud"
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
            if (onClose) onClose();
        }
    };

    // --- ESTILOS UNIFICADOS ---
    const inputClass = `w-full p-2.5 rounded-xl border outline-none transition-all font-bold ${
        darkMode ? "bg-[#334155] border-slate-600 text-white focus:border-blue-500" : "bg-gray-50 border-gray-300 text-gray-900 focus:border-blue-600"
    } ${readOnlyDefault ? "bg-transparent border-transparent cursor-default font-black text-lg" : "border-solid shadow-sm"}`;

    const labelClass = `block text-[10px] font-black uppercase tracking-widest mb-1 ${darkMode ? "text-blue-400" : "text-blue-600"}`;

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in p-1">
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
                    /* --- SECCIÓN DE BOTONES UNIFICADA --- */
                    <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t border-gray-700/30">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            /* ESTILO: Letras Rojo Sólido, Borde Rojo */
                            className={`flex-1 md:flex-none h-11 px-8 flex items-center justify-center gap-2 rounded-xl text-[11px] font-black transition-all uppercase shadow-sm active:scale-95 border-2 ${
                                darkMode 
                                ? "bg-transparent border-red-600 text-red-500 hover:bg-red-600 hover:text-white" 
                                : "bg-white border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                            }`}
                        >
                            <FaTrash size={12} /> Cancelar
                        </button>
                        
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            /* ESTILO: Bloque Sólido (Negro o Azul) */
                            className={`flex-1 md:flex-none h-11 px-10 flex items-center justify-center gap-2 rounded-xl text-[11px] font-black transition-all uppercase shadow-md active:scale-95 text-white ${
                                darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-[#1a1a1a] hover:bg-blue-700"
                            } disabled:opacity-50`}
                        >
                            {isCreate ? <FaUserPlus size={14} /> : <FaSave size={14} />}
                            {isSubmitting ? "Enviando..." : (isCreate ? "Registrar Trabajador" : "Guardar Cambios")}
                        </button>
                    </div>
                )}
            </form>

            <LoadingModal
                isOpen={modalState.isOpen}
                status={modalState.status}
                message={modalState.message}
                onClose={handleModalClose}
            />
        </>
    );
};

export default WorkerForm;
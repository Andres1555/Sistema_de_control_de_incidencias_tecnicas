import React, { useState } from 'react';
import { 
  FaChartBar, 
  FaFilter, 
  FaFileAlt, 
  FaClipboardList, 
  FaIdBadge, 
  FaUsers 
} from "react-icons/fa";
import { FiChevronDown, FiChevronRight, FiX } from "react-icons/fi";

const SidebarLayout = ({ children, isOpen, setIsOpen, darkMode, onNavigate, userRole }) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const isAdmin = userRole?.toLowerCase() === "administrador";


  const navItemClass = `w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 antialiased font-black group mb-2 shadow-md ${
    darkMode 
      ? "bg-slate-800 text-white hover:bg-blue-600" 
      : "bg-[#1a1a1a] text-white hover:bg-blue-700 active:scale-95"
  }`;

  
  const subItemClass = `w-full text-left px-4 py-2.5 text-[11px] font-black uppercase tracking-tight rounded-lg transition-all mb-1 ${
    darkMode 
      ? "bg-slate-700/50 text-slate-200 hover:bg-blue-600 hover:text-white" 
      : "bg-[#2a2a2a] text-white hover:bg-blue-600 shadow-sm"
  }`;

  return (
    <div className={`relative min-h-screen w-screen overflow-hidden transition-colors duration-500 ${darkMode ? "bg-[#0f172a]" : "bg-gray-100"}`}>
      
      
      <div 
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-screen w-72 shadow-2xl 
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${darkMode ? "bg-[#1e293b] border-r border-slate-700" : "bg-white border-r border-gray-200"}
        `}
      >
        {/* Cabecera */}
        <div className={`p-6 border-b flex justify-between items-center ${darkMode ? "border-slate-700" : "border-gray-100"}`}>
          <div className="flex flex-col">
            <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? "text-slate-500" : "text-gray-400"}`}>Sistema</span>
            <span className={`text-xl font-black tracking-tighter ${darkMode ? "text-blue-400" : "text-blue-700"}`}>
              {isAdmin ? "ADMIN PANEL" : "TÉCNICO"}
            </span>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className={`p-2 rounded-xl transition-colors ${darkMode ? "text-white hover:bg-slate-700" : "text-gray-900 hover:bg-gray-100"}`}
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Navegación Principal */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          
          <button onClick={() => { onNavigate?.('dashboard'); setIsOpen(false); }} className={navItemClass}>
            <FaClipboardList className="w-5 h-5 mr-3 flex-shrink-0 text-blue-400 group-hover:text-white transition-colors" />
            <span className="truncate">Reportes</span>
          </button>

          <button onClick={() => { onNavigate?.('tech'); setIsOpen(false); }} className={navItemClass}>
            <FaFileAlt className="w-5 h-5 mr-3 flex-shrink-0 text-blue-400 group-hover:text-white transition-colors" />
            <span className="truncate">Reportes Técnicos</span>
          </button>

          <button onClick={() => { onNavigate?.('stadistics'); setIsOpen(false); }} className={navItemClass}>
            <FaChartBar className="w-5 h-5 mr-3 flex-shrink-0 text-blue-400 group-hover:text-white transition-colors" />
            <span className="truncate">Estadísticas</span>
          </button>

          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-gray-200 space-y-1">
              <span className="px-4 mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-400">Gestión Principal</span>
              <button onClick={() => { onNavigate?.('workers'); setIsOpen(false); }} className={navItemClass}>
                <FaIdBadge className="w-5 h-5 mr-3 flex-shrink-0 text-blue-400 group-hover:text-white transition-colors" />
                <span className="truncate">Trabajadores</span>
              </button>
              <button onClick={() => { onNavigate?.('users'); setIsOpen(false); }} className={navItemClass}>
                <FaUsers className="w-5 h-5 mr-3 flex-shrink-0 text-blue-400 group-hover:text-white transition-colors" />
                <span className="truncate">Usuarios</span>
              </button>
            </div>
          )}

          {/* Sección de Filtros */}
          <div className="pt-2">
            <button 
              onClick={() => setIsFiltersOpen(!isFiltersOpen)} 
              className={navItemClass}
            >
              <div className="flex items-center truncate">
                <FaFilter className="w-5 h-5 mr-3 flex-shrink-0 text-blue-400 group-hover:text-white transition-colors" />
                <span>Filtros</span>
              </div>
              <div className="ml-auto">
                {isFiltersOpen ? <FiChevronDown /> : <FiChevronRight />}
              </div>
            </button>

            {isFiltersOpen && (
              <div className={`ml-4 mt-1 pl-4 border-l-2 space-y-1 ${darkMode ? "border-slate-700" : "border-gray-300"}`}>
                <button className={subItemClass}>
                  Por Área
                </button>
                <button className={subItemClass}>
                  Por Fecha
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t ${darkMode ? "border-slate-700" : "border-gray-100"}`}>
           <p className={`text-[10px] text-center font-black uppercase tracking-widest ${darkMode ? "text-slate-600" : "text-gray-400"}`}>
           </p>
        </div>
      </aside>

      {/* Contenido Principal */}
      <div className="w-full h-full relative overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default SidebarLayout;
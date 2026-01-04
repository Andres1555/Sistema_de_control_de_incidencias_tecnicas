import React, { useState } from 'react';
// 1. Agregamos FaClipboardList a los imports para el nuevo botón
import { FaChartBar, FaFilter, FaFileAlt, FaClipboardList } from "react-icons/fa";
import { FiChevronDown, FiChevronRight, FiX } from "react-icons/fi";

const SidebarLayout = ({ children, isOpen, setIsOpen, darkMode, onNavigate }) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  return (
    <div className={`relative min-h-screen w-screen overflow-hidden ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      
      {/* --- FONDO OSCURO (Backdrop) --- */}
      <div 
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* --- SIDEBAR DESLIZANTE --- */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 shadow-2xl 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${darkMode ? "bg-gray-800 border-r border-gray-700 text-gray-100" : "bg-white border-r border-gray-200 text-gray-800"}
        `}
      >
        <div className={`p-6 text-xl font-bold border-b flex justify-between items-center ${darkMode ? "text-blue-400 border-gray-700" : "text-blue-600 border-gray-200"}`}>
          <span>Panel Admin</span>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 rounded-md hover:bg-opacity-20 hover:bg-gray-500 focus:outline-none"
          >
            <FiX size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          
          {/* --- NUEVO BOTÓN: Reportes (General) --- */}
          <button onClick={() => { onNavigate?.('dashboard'); setIsOpen(false); }} className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${
             darkMode ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
          }`}>
            <FaClipboardList className="w-5 h-5 mr-3" />
            Reportes
          </button>

          {/* Botón Reportes Técnicos */}
          <button onClick={() => { onNavigate?.('tech'); setIsOpen(false); }} className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${
             darkMode ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
          }`}>
            <FaFileAlt className="w-5 h-5 mr-3" />
            Reportes técnicos
          </button>

          {/* Botón Estadísticas */}
          <button onClick={() => { onNavigate?.('stadistics'); setIsOpen(false); }} className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${
             darkMode ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
          }`}>
            <FaChartBar className="w-5 h-5 mr-3" />
            Estadísticas
          </button>

          {/* Botón Filtros */}
          <button 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-md transition-colors ${
              darkMode ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400" : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
            }`}
          >
            <div className="flex items-center">
              <FaFilter className="w-5 h-5 mr-3" />
              Filtros
            </div>
            {isFiltersOpen ? <FiChevronDown /> : <FiChevronRight />}
          </button>

          {isFiltersOpen && (
            <div className={`ml-4 pl-4 border-l-2 space-y-1 ${darkMode ? "border-gray-600" : "border-blue-100"}`}>
              <button className={`w-full text-left px-4 py-2 text-sm rounded-md ${
                darkMode ? "text-gray-400 hover:text-blue-400 hover:bg-gray-700" : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
              }`}>
                Por Especialidad
              </button>
              <button className={`w-full text-left px-4 py-2 text-sm rounded-md ${
                darkMode ? "text-gray-400 hover:text-blue-400 hover:bg-gray-700" : "text-gray-500 hover:text-blue-600 hover:bg-gray-50"
              }`}>
                Por Tipo de Problema
              </button>
            </div>
          )}

        </nav>
      </aside>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="w-full h-full relative">
        {children}
      </div>
    </div>
  );
};

export default SidebarLayout;
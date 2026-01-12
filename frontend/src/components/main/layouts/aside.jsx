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

  // Verificamos si el rol es administrador
  const isAdmin = userRole?.toLowerCase() === "administrador";

  const navItemClass = `w-full flex items-center px-4 py-3 rounded-md transition-colors ${
    darkMode 
      ? "text-gray-300 hover:bg-gray-700 hover:text-blue-400" 
      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
  }`;

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
          <span>Panel {isAdmin ? "Admin" : "Técnico"}</span>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1 rounded-md hover:bg-opacity-20 hover:bg-gray-500 focus:outline-none"
          >
            <FiX size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          
          {/* --- Reportes (Visible para todos) --- */}
          <button onClick={() => { onNavigate?.('dashboard'); setIsOpen(false); }} className={navItemClass}>
            <FaClipboardList className="w-5 h-5 mr-3" />
            Reportes
          </button>

          {/* Botón Reportes Técnicos (Visible para todos) */}
          <button onClick={() => { onNavigate?.('tech'); setIsOpen(false); }} className={navItemClass}>
            <FaFileAlt className="w-5 h-5 mr-3" />
            Reportes técnicos
          </button>

          {/* Botón Estadísticas (Visible para todos) */}
          <button onClick={() => { onNavigate?.('stadistics'); setIsOpen(false); }} className={navItemClass}>
            <FaChartBar className="w-5 h-5 mr-3" />
            Estadísticas
          </button>

          {/* --- SOLO PARA ADMINISTRADORES --- */}
          {isAdmin && (
            <>
              <button onClick={() => { onNavigate?.('workers'); setIsOpen(false); }} className={navItemClass}>
                <FaIdBadge className="w-5 h-5 mr-3" />
                Trabajadores
              </button>

              <button onClick={() => { onNavigate?.('users'); setIsOpen(false); }} className={navItemClass}>
                <FaUsers className="w-5 h-5 mr-3" />
                Usuarios
              </button>
            </>
          )}

          {/* Botón Filtros (Visible para todos) */}
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
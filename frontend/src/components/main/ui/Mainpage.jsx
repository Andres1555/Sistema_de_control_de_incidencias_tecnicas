import React, { useState, useEffect, useRef } from "react";
import SidebarLayout from "../layouts/aside"; 
import UserProfile from "../profile/profile"; 

import { FaSearch, FaPlus, FaArrowLeft } from "react-icons/fa";
import { FiSun, FiMoon, FiMenu } from "react-icons/fi";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ReportForm from "../form/report"; 

const Mainpage = () => {
  // --- Estados ---
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [isFormOpen, setIsFormOpen] = useState(false);

  // 2. NUEVO ESTADO: Controla la vista actual ("dashboard" o "profile")
  const [view, setView] = useState("dashboard");

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleOpenForm = () => setIsFormOpen(true);
  const handleCloseForm = () => setIsFormOpen(false);

  const handleFormSuccess = () => {
    console.log("Reporte creado con éxito, recargando lista...");
    setIsFormOpen(false);
  };

  return (
    <SidebarLayout 
      isOpen={sidebarOpen} 
      setIsOpen={setSidebarOpen} 
      darkMode={darkMode}
    >
      
      {/* --- HEADER --- */}
      <header
        className={`${
          darkMode ? "bg-gray-800 text-gray-100 border-gray-700" : "bg-white text-gray-800 border-gray-200"
        } shadow-sm w-full border-b transition-colors relative z-10`}
      >
        <div className="w-full px-6 py-4 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            {/* Botón Hamburguesa */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className={`p-2 rounded hover:bg-opacity-20 transition-colors focus:outline-none ${
                darkMode ? "hover:bg-gray-400" : "hover:bg-gray-300"
              }`}
            >
              <FiMenu size={24} />
            </button>

            {/* TÍTULO DINÁMICO CON BOTÓN DE REGRESO */}
            <div className="flex items-center gap-2">
              {view === "profile" && (
                <button 
                  onClick={() => setView("dashboard")} 
                  className="p-1 rounded-full hover:bg-gray-500/30 transition text-sm"
                  title="Volver a reportes"
                >
                  <FaArrowLeft />
                </button>
              )}
              <h1 className="text-xl font-bold">
                {view === "dashboard" ? "Gestión de reportes" : "Mi Perfil"}
              </h1>
            </div>
          </div>

          {/* Controles Derecha */}
          <div className="flex items-center space-x-4">
            
            <button onClick={toggleTheme} className="text-xl p-2 rounded-full hover:bg-opacity-20 hover:bg-gray-500">
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>

            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Buscar..."
                className={`pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode
                    ? "bg-gray-700 text-gray-200 border-gray-600"
                    : "bg-white text-gray-800 border-gray-300"
                }`}
              />
              <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
            </div>

            {/* Menú Usuario */}
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none block">
                <img
                  src="https://via.placeholder.com/32"
                  alt="Usuario"
                  className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500"
                />
              </button>

              {menuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-40 rounded shadow-lg z-50 ${
                    darkMode
                      ? "bg-gray-800 border border-gray-700 text-gray-200"
                      : "bg-white border border-gray-300 text-gray-800"
                  }`}
                >
                  {/* 3. AQUÍ ESTÁ EL CAMBIO: Al dar click, cambia la vista y cierra el menú */}
                  <button 
                    onClick={() => {
                      setView("profile"); // Cambia a perfil
                      setMenuOpen(false); // Cierra dropdown
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-opacity-20 hover:bg-gray-500"
                  >
                    Perfil
                  </button>

                  <button className="block w-full text-left px-4 py-2 text-sm hover:bg-opacity-20 hover:bg-gray-500">
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className={`flex-grow w-full px-6 py-6 h-[calc(100vh-80px)] overflow-y-auto ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
        
        {/* 4. RENDERIZADO CONDICIONAL */}
        {view === "dashboard" ? (
          /* CASO 1: MUESTRA LA TABLA DE REPORTES */
          <div className={`w-full h-96 border-2 border-dashed rounded-lg flex items-center justify-center ${
              darkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-300 bg-gray-50"
          }`}>
              <p className="opacity-60">Contenido de gestión de reportes...</p>
          </div>
        ) : (
          /* CASO 2: MUESTRA EL COMPONENTE DE PERFIL */
          <UserProfile darkMode={darkMode} />
        )}

      </main>

      {/* --- BOTÓN FLOTANTE (+) --- */}
      {/* Solo mostramos el botón de agregar si estamos en el dashboard */}
      {view === "dashboard" && (
        <button
          onClick={handleOpenForm}
          className="fixed bottom-8 right-8 p-4 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white transition-transform transform hover:scale-110 focus:outline-none z-30 flex items-center justify-center"
          aria-label="Agregar nuevo reporte"
        >
          <FaPlus size={24} />
        </button>
      )}

      {/* --- MODAL FORMULARIO --- */}
      <Dialog
        open={isFormOpen}
        onClose={handleCloseForm}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: {
            backgroundColor: darkMode ? "#1f2937" : "#ffffff",
            color: darkMode ? "#ffffff" : "#000000",
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Nuevo Reporte</span>
          <IconButton
            aria-label="close"
            onClick={handleCloseForm}
            sx={{
              color: (theme) => darkMode ? '#9ca3af' : theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ borderColor: darkMode ? '#374151' : undefined }}>
          <ReportForm 
            onSuccess={handleFormSuccess}
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>

    </SidebarLayout>
  );
};

export default Mainpage;
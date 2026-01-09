import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReportList from "../card/reportlist";
import ReportForm from "../form/report";
// Se cambia la importación al nuevo componente WorkerProfile
import WorkerProfile from "../profile/workersprofile"; 
import { FiSun, FiMoon } from "react-icons/fi";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const WorkersPage = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const t = localStorage.getItem('theme');
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return true;
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [view, setView] = useState("dashboard"); // 'dashboard' o 'profile'
  const [menuOpen, setMenuOpen] = useState(false);
  
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => setDarkMode((s) => {
    const next = !s;
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
    return next;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('workerFicha'); // Limpiamos también la ficha si existe
    navigate('/login');
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setIsFormOpen(false);
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 min-h-screen text-gray-100' : 'bg-gray-100 min-h-screen text-gray-800'}`}>
      
      {/* --- HEADER --- */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm w-full border-b p-4 flex items-center justify-between sticky top-0 z-40`}>
        <div className="flex items-center gap-2">
          {view === "profile" && (
            <button 
              onClick={() => setView("dashboard")} 
              className="p-2 rounded-full hover:bg-gray-500/20 transition-colors"
              title="Volver a reportes"
            >
              <FaArrowLeft />
            </button>
          )}
          <h1 className="text-xl font-bold">
            {view === "dashboard" ? "Panel Trabajador" : "Mi Perfil"}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-500/10 transition-colors">
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          {/* Menú del Usuario (Avatar con Dropdown) */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="focus:outline-none block"
            >
              <img
                src="https://via.placeholder.com/35"
                alt="Usuario"
                className="w-9 h-9 rounded-full border-2 border-blue-500 cursor-pointer hover:scale-105 transition-transform"
              />
            </button>

            {menuOpen && (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl z-50 overflow-hidden ${
                  darkMode
                    ? "bg-gray-800 border border-gray-700 text-gray-200"
                    : "bg-white border border-gray-200 text-gray-800"
                }`}
              >
                <div className="px-4 py-3 border-b border-gray-700/10 bg-gray-500/5">
                  <p className="text-xs font-semibold uppercase opacity-50">Opciones</p>
                </div>
                
                <button 
                  onClick={() => { setView("profile"); setMenuOpen(false); }}
                  className="block w-full text-left px-4 py-3 text-sm hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Ver Perfil
                </button>

                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="p-6">
        {view === "dashboard" ? (
          <div className="max-w-7xl mx-auto pb-20">
            <ReportList key={refreshKey} darkMode={darkMode} />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* Aquí renderizamos el WorkerProfile en lugar del UserProfile antiguo */}
            <WorkerProfile darkMode={darkMode} />
          </div>
        )}
      </main>

      {/* --- BOTÓN FLOTANTE (Solo en Dashboard) --- */}
      {view === "dashboard" && (
        <button
          onClick={() => setIsFormOpen(true)}
          className="fixed bottom-8 right-8 p-4 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white transition-transform transform hover:scale-110 focus:outline-none z-30 flex items-center justify-center"
        >
          <FaPlus size={24} />
        </button>
      )}

      {/* --- MODAL FORMULARIO --- */}
      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ 
          style: { 
            backgroundColor: darkMode ? "#1f2937" : "#ffffff", 
            color: darkMode ? "#ffffff" : "#000000",
            borderRadius: "12px"
          } 
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="font-bold">Nuevo Reporte</span>
          <IconButton aria-label="close" onClick={() => setIsFormOpen(false)} sx={{ color: darkMode ? '#9ca3af' : 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
          <ReportForm onSuccess={handleFormSuccess} onClose={() => setIsFormOpen(false)} darkMode={darkMode} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkersPage;
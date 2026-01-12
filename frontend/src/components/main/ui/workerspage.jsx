import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReportList from "../card/reportlist";
// Importación del formulario específico para trabajadores
import ReportWorker from "../form/reportworker"; 
import WorkerProfile from "../profile/workersprofile"; 
import { FiSun, FiMoon } from "react-icons/fi";
import { FaArrowLeft, FaPlus, FaSearch } from "react-icons/fa";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const WorkersPage = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const t = localStorage.getItem('theme');
    return t === 'dark';
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [view, setView] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const menuRef = useRef(null);
  const navigate = useNavigate();

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
    localStorage.setItem('theme', next ? 'dark' : 'light');
    return next;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    navigate('/', { replace: true });
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setIsFormOpen(false);
  };

  return (
    <div className={`min-h-screen w-full flex flex-col ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'} transition-colors duration-300`}>
      
      {/* --- HEADER --- */}
      <header className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow-sm w-full border-b transition-colors sticky top-0 z-40`}>
        <div className="w-full px-6 py-4 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => view === "profile" ? setView("dashboard") : navigate(-1)} 
              className={`p-2 rounded hover:bg-opacity-20 transition-colors ${darkMode ? "hover:bg-gray-400" : "hover:bg-gray-300"}`}
            >
              <FaArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">
              {view === "dashboard" ? "Panel Trabajador" : "Mi Perfil"}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={toggleTheme} className="text-xl p-2 rounded-full hover:bg-gray-500/20">
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>

            {view === "dashboard" && (
              <div className="relative hidden sm:block">
                <input
                  type="text"
                  placeholder="Buscar reporte..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all w-64 md:w-80 ${
                    darkMode ? "bg-gray-700 text-gray-200 border-gray-600" : "bg-white text-gray-800 border-gray-300"
                  }`}
                />
                <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
              </div>
            )}

            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen(!menuOpen)} className="focus:outline-none block">
                <img src="https://via.placeholder.com/32" alt="Usuario" className="w-8 h-8 rounded-full border-2 border-blue-500 cursor-pointer" />
              </button>
              {menuOpen && (
                <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl z-50 overflow-hidden border ${darkMode ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-200 text-gray-800"}`}>
                  <button onClick={() => { setView("profile"); setMenuOpen(false); }} className="block w-full text-left px-4 py-2.5 text-sm hover:bg-blue-600 hover:text-white transition-colors">
                    Ver Perfil
                  </button>
                  <div className={`h-[1px] w-full ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}></div>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 font-bold transition-colors">
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className={`flex-grow w-full px-6 py-6 h-[calc(100vh-80px)] overflow-y-auto`}>
        {view === "dashboard" ? (
          <div className="pb-20">
            <ReportList key={refreshKey} darkMode={darkMode} searchTerm={searchTerm} />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <WorkerProfile darkMode={darkMode} />
          </div>
        )}
      </main>

      {/* --- BOTÓN FLOTANTE --- */}
      {!isFormOpen && view === "dashboard" && (
        <button
          onClick={() => setIsFormOpen(true)}
          className="fixed bottom-8 right-8 p-4 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white transition-transform transform hover:scale-110 focus:outline-none z-30 flex items-center justify-center"
        >
          <FaPlus size={24} />
        </button>
      )}

      {/* --- MODAL CON EL FORMULARIO REPORTWORKER --- */}
      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ style: { backgroundColor: darkMode ? "#1f2937" : "#ffffff", color: darkMode ? "#ffffff" : "#000000", borderRadius: "16px" } }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="font-bold uppercase text-xs tracking-widest opacity-70">Nuevo Reporte</span>
          <IconButton onClick={() => setIsFormOpen(false)} sx={{ color: darkMode ? '#9ca3af' : 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: darkMode ? '#374151' : '#e5e7eb' }}>
          {/* Aquí se usa el nuevo componente ReportWorker */}
          <ReportWorker 
            onSuccess={handleFormSuccess} 
            onClose={() => setIsFormOpen(false)} 
            darkMode={darkMode} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkersPage;
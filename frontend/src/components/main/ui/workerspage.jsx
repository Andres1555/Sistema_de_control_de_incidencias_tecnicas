import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReportListByID from "../card/reportlistbyid"; 
import ReportWorker from "../form/reportworker"; 
import WorkerProfile from "../profile/workersprofile"; 
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { FaArrowLeft, FaPlus, FaSearch, FaUser } from "react-icons/fa";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const WorkersPage = () => {
  // --- Estados ---
  const [darkMode, setDarkMode] = useState(() => {
    const t = localStorage.getItem('theme');
    return t === 'dark';
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [view, setView] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchMobileOpen, setIsSearchMobileOpen] = useState(false);
  
  const userName = localStorage.getItem('userName') || "Trabajador";
  const userRole = localStorage.getItem('role') || "trabajador";
  const userInitial = userName.charAt(0).toUpperCase();

  const menuRef = useRef(null);
  const navigate = useNavigate();

  // --- Efectos ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---
  const toggleTheme = () => setDarkMode((s) => {
    const next = !s;
    localStorage.setItem('theme', next ? 'dark' : 'light');
    return next;
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setIsFormOpen(false);
  };

  const avatarBg = darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-700 hover:bg-blue-800";

  return (
    <div className={`min-h-screen w-full flex flex-col transition-colors duration-300 ${
      darkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* --- HEADER RESPONSIVE --- */}
      <header className={`${
        darkMode ? "bg-[#1e293b] border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-800"
      } shadow-sm w-full border-b sticky top-0 z-40 transition-colors`}>
        
        <div className="w-full px-3 md:px-6 py-2.5 flex items-center justify-between gap-2">
          
          {/* LADO IZQUIERDO: Título y Navegación */}
          <div className="flex items-center gap-1.5 md:gap-4 min-w-0">
            {view === "profile" && (
              <button 
                onClick={() => setView("dashboard")} 
                className="p-2 rounded-lg hover:bg-slate-500/10 transition-colors flex-shrink-0"
              >
                <FaArrowLeft size={16} />
              </button>
            )}
            
            {!isSearchMobileOpen && (
              <h1 className="text-base md:text-xl font-black truncate leading-tight">
                {view === "dashboard" ? "Panel Trabajador" : "Mi Perfil"}
              </h1>
            )}
          </div>

          {/* LADO DERECHO: Acciones */}
          <div className="flex items-center gap-1 md:gap-4 flex-shrink-0">
            
            {/* Buscador de Escritorio */}
            {view === "dashboard" && (
              <>
                <button 
                  onClick={() => setIsSearchMobileOpen(true)} 
                  className="sm:hidden p-2 rounded-full hover:bg-slate-500/10 flex-shrink-0"
                >
                  <FaSearch size={18} className="text-slate-500" />
                </button>

                <div className="relative hidden sm:block">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 border rounded-xl text-sm w-48 md:w-64 lg:w-80 transition-all focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? "bg-[#334155] border-slate-600" : "bg-slate-50 border-slate-300"
                    }`}
                  />
                  <FaSearch className="absolute left-3 top-2.5 text-slate-400" />
                </div>
              </>
            )}

            <button onClick={toggleTheme} className="p-2 rounded-full flex-shrink-0 transition-colors hover:bg-slate-500/10">
              {darkMode ? <FiSun className="text-yellow-400" size={18} /> : <FiMoon className="text-blue-700" size={18} />}
            </button>

            {/* Avatar Perfil (flex-shrink-0 para evitar cortes) */}
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-base border-2 ${darkMode ? 'border-slate-700' : 'border-slate-100'} ${avatarBg} shadow-sm active:scale-90 transition-transform`}
              >
                {userInitial}
              </button>

              {menuOpen && (
                <div className={`absolute right-0 mt-3 w-52 md:w-64 rounded-2xl shadow-2xl z-50 py-2 border animate-in zoom-in-95 duration-100 ${
                  darkMode ? "bg-[#1e293b] border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-800"
                }`}>
                  <div className={`px-4 py-3 mb-2 border-b flex flex-col ${darkMode ? "border-slate-700 bg-slate-800/40" : "border-slate-100 bg-slate-50"}`}>
                    <span className="text-[10px] font-black uppercase opacity-40">Cuenta</span>
                    <span className="text-sm font-bold truncate">{userName}</span>
                    <span className="text-[10px] opacity-60 capitalize">{userRole}</span>
                  </div>
                  
                  <div className="px-2 space-y-1">
                    <button 
                      onClick={() => { setView("profile"); setMenuOpen(false); }} 
                      className={`flex items-center gap-3 w-full px-3 py-2.5 text-xs md:text-sm rounded-xl transition-colors ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
                    >
                      <FaUser className="text-blue-500" /> Perfil
                    </button>
                    <button 
                      onClick={handleLogout} 
                      className={`flex items-center gap-3 w-full px-3 py-2.5 text-xs md:text-sm font-bold text-red-500 rounded-xl transition-colors ${darkMode ? "hover:bg-red-500/10" : "hover:bg-red-50"}`}
                    >
                      <FiLogOut /> Salir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buscador Expandible (Mobile Overlay) */}
        {view === "dashboard" && isSearchMobileOpen && (
           <div className="absolute inset-0 px-3 bg-inherit flex items-center z-50 animate-in slide-in-from-top-2">
             <div className="relative w-full flex items-center gap-2">
               <FaSearch className="absolute left-3 text-slate-400" size={14} />
               <input
                autoFocus
                type="text"
                placeholder="Buscar reportes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode ? "bg-[#334155] text-white border-slate-600" : "bg-slate-50 border-slate-300"
                }`}
              />
              <button 
                onClick={() => {setIsSearchMobileOpen(false); setSearchTerm("")}} 
                className="p-2"
              >
                <CloseIcon fontSize="small" />
              </button>
             </div>
           </div>
        )}
      </header>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className={`flex-grow w-full px-3 md:px-6 py-4 md:py-6 h-[calc(100vh-64px)] overflow-y-auto`}>
        <div className="max-w-7xl mx-auto">
          {view === "dashboard" ? (
            <div className="pb-24 animate-fade-in">
              <ReportListByID key={refreshKey} darkMode={darkMode} searchTerm={searchTerm} />
            </div>
          ) : (
            <div className="animate-fade-in">
              <WorkerProfile darkMode={darkMode} />
            </div>
          )}
        </div>
      </main>

      {/* Botón Flotante Adaptativo */}
      {!isFormOpen && view === "dashboard" && (
        <button
          onClick={() => setIsFormOpen(true)}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all transform hover:scale-110 active:scale-95 z-30 flex items-center justify-center"
        >
          <FaPlus size={20} className="md:size-6" />
        </button>
      )}

      {/* Modal de Reporte Responsive */}
      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        fullWidth
        maxWidth="sm"
        fullScreen={window.innerWidth < 640} // Pantalla completa en móviles
        PaperProps={{ 
          style: { 
            backgroundColor: darkMode ? "#1e293b" : "#ffffff", 
            color: darkMode ? "#f1f5f9" : "#000000", 
            borderRadius: window.innerWidth < 640 ? "0" : "24px",
            backgroundImage: "none"
          } 
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="font-black uppercase text-[10px] md:text-xs tracking-widest opacity-60">Nuevo Reporte</span>
          <IconButton onClick={() => setIsFormOpen(false)} size="small" sx={{ color: darkMode ? '#94a3b8' : 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ borderColor: darkMode ? '#334155' : '#f1f5f9', p: { xs: 2, md: 3 } }}>
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
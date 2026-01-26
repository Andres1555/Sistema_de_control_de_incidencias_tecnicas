import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// --- CAMBIO: Importamos la lista específica ---
import ReportListByID from "../card/reportlistbyid"; 
import ReportWorker from "../form/reportworker"; 
import WorkerProfile from "../profile/workersprofile"; 
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { FaArrowLeft, FaPlus, FaSearch, FaUser } from "react-icons/fa";
import { Dialog, DialogTitle, DialogContent, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const WorkersPage = () => {
  // --- VARIABLE DE ENTORNO ---
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // --- Estados ---
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // Si no hay nada guardado, por defecto iniciamos en Dark Mode (Azul Navy)
    if (savedTheme === null) return true;
    return savedTheme === 'dark';
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

  // Limpiar búsqueda al cambiar de vista
  useEffect(() => {
    setSearchTerm("");
  }, [view]);

  // --- Handlers ---
  const toggleTheme = () => setDarkMode((s) => {
    const next = !s;
    localStorage.setItem('theme', next ? 'dark' : 'light');
    return next;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    // No borramos 'theme' para mantener su preferencia visual
    setMenuOpen(false);
    navigate('/', { replace: true });
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setIsFormOpen(false);
  };

  const avatarBg = darkMode ? "bg-blue-600 hover:bg-blue-500" : "bg-[#1a1a1a] hover:bg-blue-700";
  const solidBtnClass = darkMode 
    ? "bg-slate-800 text-white hover:bg-blue-600 border border-slate-700" 
    : "bg-[#1a1a1a] text-white hover:bg-blue-700 shadow-lg active:scale-95";

  return (
    <div className={`min-h-screen w-full flex flex-col transition-colors duration-300 ${
      darkMode ? 'bg-[#0f172a] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* --- HEADER FULL WIDTH --- */}
      <header className={`${
        darkMode ? "bg-[#1e293b] border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-800"
      } shadow-sm w-full border-b sticky top-0 z-40 transition-colors`}>
        
        <div className="w-full px-4 md:px-6 py-2.5 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 min-w-0">
            {view === "profile" && (
              <button 
                onClick={() => setView("dashboard")} 
                className={`p-2 rounded-xl transition-all ${solidBtnClass}`}
              >
                <FaArrowLeft size={14} />
              </button>
            )}
            
            {!isSearchMobileOpen && (
              <h1 className="text-lg md:text-xl font-black truncate uppercase tracking-tighter ml-1">
                {view === "dashboard" ? "Panel Trabajador" : "Mi Perfil"}
              </h1>
            )}
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {/* Buscador Desktop */}
            {view === "dashboard" && (
              <>
                <button onClick={() => setIsSearchMobileOpen(true)} className="sm:hidden p-2 rounded-xl hover:bg-slate-500/10 transition-colors">
                  <FaSearch size={18} className="text-slate-500" />
                </button>
                
                <div className="relative hidden sm:block">
                  <input
                    type="text"
                    placeholder="Buscar en mis reportes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 border rounded-xl text-sm w-48 xl:w-96 transition-all font-bold ${
                      darkMode ? "bg-[#334155] text-white border-slate-600" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                  <FaSearch className="absolute left-3 top-2.5 text-slate-400" />
                </div>
              </>
            )}

            <button onClick={toggleTheme} className="p-2 rounded-full transition-transform active:scale-90">
              {darkMode ? <FiSun className="text-yellow-400" size={20} /> : <FiMoon className="text-blue-700" size={20} />}
            </button>

            {/* Avatar Perfil Estilo Gmail */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-base shadow-xl transition-all active:scale-90 focus:outline-none ${avatarBg}`}
              >
                {userInitial}
              </button>

              {menuOpen && (
                <div className={`absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl z-50 py-2 border animate-in zoom-in-95 duration-100 ${
                  darkMode ? "bg-[#1e293b] border-slate-700 text-white" : "bg-white border-slate-200 text-slate-800"
                }`}>
                  <div className={`px-4 py-3 mb-2 border-b flex flex-col ${darkMode ? "border-slate-700 bg-slate-800/40" : "border-slate-100 bg-slate-50"}`}>
                    <span className="text-[10px] font-black uppercase opacity-40">Cuenta</span>
                    <span className="text-sm font-black truncate">{userName}</span>
                    <span className="text-[10px] font-bold opacity-60 capitalize">{userRole}</span>
                  </div>
                  <div className="px-2 space-y-1">
                    <button onClick={() => { setView("profile"); setMenuOpen(false); }} className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-black rounded-xl uppercase tracking-tighter ${solidBtnClass}`}><FaUser size={12} /> Perfil</button>
                    <button onClick={handleLogout} className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-black rounded-xl uppercase tracking-tighter bg-red-600 text-white hover:bg-red-700`}><FiLogOut size={14} /> Salir</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buscador Mobile Overlay */}
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
                 className={`w-full pl-9 pr-10 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold ${
                   darkMode ? "bg-[#334155] text-white border-slate-600" : "bg-slate-50 border-slate-300 text-slate-900"
                 }`}
               />
               <button onClick={() => {setIsSearchMobileOpen(false); setSearchTerm("")}} className={`p-2 rounded-xl ${solidBtnClass}`}>
                 <CloseIcon fontSize="small" />
               </button>
              </div>
            </div>
        )}
      </header>

      {/* --- MAIN CONTENT (FULL WIDTH) --- */}
      <main className={`flex-grow w-full h-[calc(100vh-64px)] overflow-y-auto transition-colors ${
        darkMode ? "bg-[#0f172a]" : "bg-slate-100"
      }`}>
        <div className="w-full px-4 md:px-8 py-6 transition-all duration-300">
          {view === "dashboard" ? (
            <div className="pb-24 animate-fade-in">
              <ReportListByID key={refreshKey} darkMode={darkMode} searchTerm={searchTerm} />
            </div>
          ) : (
            <div className="max-w-5xl mx-auto animate-fade-in">
              <WorkerProfile darkMode={darkMode} />
            </div>
          )}
        </div>
      </main>

      {/* BOTÓN FLOTANTE */}
      {!isFormOpen && view === "dashboard" && (
        <button
          onClick={() => setIsFormOpen(true)}
          className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl text-white transition-all transform hover:scale-110 active:scale-95 z-30 flex items-center justify-center ${
            darkMode ? "bg-blue-600" : "bg-[#1a1a1a]"
          }`}
        >
          <FaPlus size={24} />
        </button>
      )}

      {/* MODAL RESPONSIVE */}
      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: {
            backgroundColor: darkMode ? "#1e293b" : "#ffffff", 
            color: darkMode ? "#f1f5f9" : "#000000",
            borderRadius: window.innerWidth < 640 ? '0' : '24px',
            backgroundImage: 'none'
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="font-bold uppercase text-xs tracking-widest opacity-60">Nuevo Reporte</span>
          <IconButton onClick={() => setIsFormOpen(false)} size="small" sx={{ color: darkMode ? '#94a3b8' : 'inherit' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: darkMode ? '#334155' : '#f1f5f9', p: { xs: 2, md: 3 } }}>
          <ReportWorker onSuccess={handleFormSuccess} onClose={() => setIsFormOpen(false)} darkMode={darkMode} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkersPage;
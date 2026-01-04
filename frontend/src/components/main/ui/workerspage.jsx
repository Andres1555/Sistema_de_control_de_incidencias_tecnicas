import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReportList from "../card/reportlist";
import ReportForm from "../form/report";
import { FiSun, FiMoon } from "react-icons/fi";
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

  const navigate = useNavigate();

  const toggleTheme = () => setDarkMode((s) => {
    const next = !s;
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
    return next;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setIsFormOpen(false);
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 min-h-screen text-gray-100' : 'bg-gray-100 min-h-screen text-gray-800'}`}>
      <header className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm w-full border-b p-4 flex items-center justify-between` }>
        <h1 className="text-xl font-bold">Panel Trabajador</h1>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded">{darkMode ? <FiSun /> : <FiMoon />}</button>
          <button onClick={handleLogout} className="px-3 py-1 rounded bg-red-600 text-white">Cerrar sesión</button>
        </div>
      </header>

      <main className="p-6">
        <div className="pb-20">
          <ReportList key={refreshKey} darkMode={darkMode} />
        </div>
      </main>

      {/* Floating + button to open report form */}
      <button
        onClick={() => setIsFormOpen(true)}
        className="fixed bottom-8 right-8 p-4 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white transition-transform transform hover:scale-110 focus:outline-none z-30 flex items-center justify-center"
        aria-label="Agregar nuevo reporte"
      >
        +
      </button>

      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ style: { backgroundColor: darkMode ? "#1f2937" : "#ffffff", color: darkMode ? "#ffffff" : "#000000" } }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Nuevo Reporte</span>
          <IconButton aria-label="close" onClick={() => setIsFormOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: darkMode ? '#374151' : undefined }}>
          <ReportForm onSuccess={handleFormSuccess} onClose={() => setIsFormOpen(false)} darkMode={darkMode} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkersPage;

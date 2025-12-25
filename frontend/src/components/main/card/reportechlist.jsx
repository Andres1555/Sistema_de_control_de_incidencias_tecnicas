import React, { useEffect, useState } from "react";
import axios from "axios";
import ReportTechCard from "./reportechcard";

const ReportTechList = ({ userId }) => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError("Se requiere userId para obtener los casos técnicos");
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchCases = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:8080/api/report_cases/user/${userId}`);
        if (mounted) setCases(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching report cases:", err);
        if (mounted) setError("No se pudieron cargar los casos técnicos");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCases();
    return () => (mounted = false);
  }, [userId]);

  const handleView = (report) => {
    alert(`Ver caso técnico: ${report.caso_tecnico || report.id}`);
  };

  if (loading) return <div className="p-6 text-center">Cargando casos técnicos...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!cases.length) return <div className="p-6 text-center text-gray-600">No hay casos técnicos para mostrar</div>;

  return (
    <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-4">
      {cases.map((c) => (
        <ReportTechCard key={c.id} report={c} onView={handleView} />
      ))}
    </section>
  );
};

export default ReportTechList;

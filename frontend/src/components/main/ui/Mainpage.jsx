import React from "react";
import ReportList from "@/components/main/card/reportlist";

const Mainpage = () => {
	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm">
				<div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
					<h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
					<div className="text-sm text-gray-600">Usuario</div>
				</div>
			</header>

			<main className="max-w-6xl mx-auto px-4 py-6">
				<section className="mb-6">
					<h2 className="text-lg font-semibold text-gray-700">Reportes recientes</h2>
					<p className="text-sm text-gray-500">Lista de reportes en formato tarjeta.</p>
				</section>

				<ReportList />
			</main>
		</div>
	);
};

export default Mainpage;

import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

const ImportanciaCaracteristicas = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [umbral, setUmbral] = useState(0); // nuevo estado del umbral

  useEffect(() => {
    const cargar = async () => {
      try {
        const resp = await fetch("http://localhost:5001/api/Predicciones/importancia-caracteristicas");
        if (!resp.ok) throw new Error(`Error HTTP ${resp.status}`);
        const json = await resp.json();

        const ordenado = json
          .map((d) => ({
            feature: d.Feature,
            deltaAUC: parseFloat(d.DeltaAUC ?? 0),
          }))
          .sort((a, b) => Math.abs(b.deltaAUC) - Math.abs(a.deltaAUC));

        setData(ordenado);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setError(err.message);
      }
    };

    cargar();
  }, []);

  if (error) return <p className="text-red-500">⚠️ {error}</p>;
  if (data.length === 0) return <p className="text-gray-400">Cargando datos...</p>;

  // Aplicar el filtro del umbral
  const filtrado = data.filter((d) => Math.abs(d.deltaAUC) > umbral);

  const labels = filtrado.map((d) => d.feature);
  const valores = filtrado.map((d) => d.deltaAUC);
  const colores = valores.map((v) =>
    v >= 0 ? "rgba(16, 185, 129, 0.9)" : "rgba(239, 68, 68, 0.9)"
  );
  const sombras = valores.map((v) =>
    v >= 0 ? "rgba(5, 150, 105, 0.3)" : "rgba(220, 38, 38, 0.3)"
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Delta AUC",
        data: valores,
        backgroundColor: colores,
        borderColor: sombras,
        borderWidth: 2,
        borderSkipped: false,
        borderRadius: 10,
        hoverBackgroundColor: "rgba(255,255,255,0.9)",
        barThickness: 20,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.x.toFixed(4)}`,
        },
      },
      datalabels: {
        color: "#fff",
        anchor: "end",
        align: "right",
        formatter: (value) => value.toFixed(4),
      },
    },
    scales: {
      x: {
        ticks: { color: "#ccc", font: { size: 12 } },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        ticks: { color: "#ccc", font: { size: 12 } },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
    animation: {
      duration: 1200,
      easing: "easeOutQuart",
    },
  };

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">
        Importancia de las Características del Modelo
      </h2>

      {/* Control de umbral */}
      <div className="flex flex-col sm:flex-row items-center justify-center mb-6 gap-4">
        <label className="text-gray-300">
          Umbral mínimo de |ΔAUC|: <span className="font-bold">{umbral.toFixed(3)}</span>
        </label>
        <input
          type="range"
          min="0"
          max="0.5"
          step="0.01"
          value={umbral}
          onChange={(e) => setUmbral(parseFloat(e.target.value))}
          className="w-64 accent-emerald-400"
        />
      </div>

      <Bar data={chartData} options={options} />

      <p className="text-gray-400 text-sm mt-4 text-center">
        Mostrando {filtrado.length} características con |ΔAUC| &gt; {umbral.toFixed(3)}
      </p>
    </div>
  );
};

export default ImportanciaCaracteristicas;

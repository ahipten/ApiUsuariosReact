import React, { useState, useEffect } from "react";

const RecomendacionRiego = () => {
  const [cultivo, setCultivo] = useState("");
  const [recomendacion, setRecomendacion] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const historialGuardado = localStorage.getItem("historialRiego");
    if (historialGuardado) {
      setHistorial(JSON.parse(historialGuardado));
    }
  }, []);

  const obtenerRecomendacion = async () => {
    if (!cultivo) {
      setError("Por favor, selecciona un cultivo.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:5001/api/Predicciones/recomendacion?cultivo=${encodeURIComponent(
          cultivo
        )}`
      );

      if (!response.ok) {
        throw new Error("No se pudo obtener la recomendación.");
      }

      const data = await response.json();
      setRecomendacion(data);

      const nuevaEntrada = {
        fecha: new Date().toLocaleString(),
        cultivo: data.cultivo,
        mensaje: data.mensaje,
        metodo: data.metodo_riego,
      };

      const nuevoHistorial = [nuevaEntrada, ...historial].slice(0, 5);
      setHistorial(nuevoHistorial);
      localStorage.setItem("historialRiego", JSON.stringify(nuevoHistorial));
    } catch (err) {
      setError(err.message);
      setRecomendacion(null);
    } finally {
      setLoading(false);
    }
  };

  const reproducirMensaje = () => {
    if (recomendacion?.mensaje) {
      const utterance = new SpeechSynthesisUtterance(recomendacion.mensaje);
      utterance.lang = "es-PE";
      utterance.rate = 1;
      speechSynthesis.speak(utterance);
    }
  };

  // 🗑️ Nueva función para borrar el historial
  const borrarHistorial = () => {
    if (window.confirm("¿Seguro que deseas borrar todo el historial?")) {
      setHistorial([]);
      localStorage.removeItem("historialRiego");
    }
  };

  return (
    <div
      className="card p-5 rounded-lg max-w-md mx-auto 
                  bg-gray-800 text-white shadow-xl border border-gray-700"
    >
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        💧 Recomendación de Riego
      </h2>

      <select
        className="border border-gray-600 bg-gray-700 text-white p-2 rounded w-full mb-3"
        value={cultivo}
        onChange={(e) => setCultivo(e.target.value)}
      >
        <option value="">Selecciona un cultivo</option>
        <option value="Maíz">Maíz</option>
        <option value="Espárrago">Espárrago</option>
        <option value="Mango">Mango</option>
        <option value="Palta">Palta</option>
        <option value="Plátano">Plátano</option>
      </select>

      <button
        onClick={obtenerRecomendacion}
        disabled={loading}
        className={`w-full px-4 py-2 rounded text-white font-medium transition-all
        ${
          loading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Consultando..." : "Obtener recomendación"}
      </button>

      {error && <p className="mt-3 text-red-400">{error}</p>}

      {recomendacion && (
        <div className="mt-5 border-t border-gray-600 pt-3">
          <h3 className="font-semibold text-lg mb-2">{recomendacion.cultivo}</h3>
          <p className="text-gray-300 mb-3">{recomendacion.mensaje}</p>

          <button
            onClick={reproducirMensaje}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-3"
          >
            🔊 Escuchar recomendación
          </button>

          <ul className="text-sm text-gray-300 space-y-1">
            <li>
              <strong>Método:</strong> {recomendacion.metodo_riego}
            </li>
            <li>
              <strong>Lámina neta:</strong> {recomendacion.lamina_neta_mm} mm
            </li>
            <li>
              <strong>Eficiencia:</strong> {recomendacion.eficiencia}
            </li>
            <li>
              <strong>Volumen recomendado:</strong>{" "}
              {recomendacion.volumen_recomendado_m3} m³
            </li>
          </ul>
        </div>
      )}

      {historial.length > 0 && (
        <div className="mt-6 border-t border-gray-600 pt-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-md text-yellow-400">
              📜 Historial reciente
            </h4>
            <button
              onClick={borrarHistorial}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              🗑️ Borrar historial
            </button>
          </div>

          <ul className="text-sm text-gray-300 space-y-2">
            {historial.map((item, index) => (
              <li key={index} className="border-b border-gray-700 pb-2">
                <strong>{item.cultivo}</strong> — {item.mensaje}
                <br />
                <span className="text-gray-500 text-xs">{item.fecha}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RecomendacionRiego;

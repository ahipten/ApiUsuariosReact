// src/utils/speechUtils.js
export const hablarMensaje = (texto) => {
  if (!window.speechSynthesis) {
    alert("La función de voz no está disponible en este dispositivo.");
    return;
  }

  // Cancelar si hay una voz activa
  window.speechSynthesis.cancel();

  const mensaje = new SpeechSynthesisUtterance(texto);
  mensaje.lang = "es-PE"; // español latino, puedes usar es-MX o es-ES
  mensaje.rate = 0.95;
  mensaje.pitch = 1;
  window.speechSynthesis.speak(mensaje);
};

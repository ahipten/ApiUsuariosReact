/** @type {import('tailwindcss').Config} */
module.exports = {
  // 🧭 Escaneo de archivos donde Tailwind buscará clases
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/scss/**/*.{scss,sass}",
  ],

  // 🌓 Modo oscuro basado en la preferencia del sistema o clase "dark"
  darkMode: 'class', // Cambia a 'media' si prefieres que sea automático por sistema

  theme: {
    extend: {
      // 🎨 Colores basados en las variables de CoreUI
      colors: {
        primary: "var(--cui-primary)",
        secondary: "var(--cui-secondary)",
        success: "var(--cui-success)",
        danger: "var(--cui-danger)",
        warning: "var(--cui-warning)",
        info: "var(--cui-info)",
        light: "var(--cui-light)",
        dark: "var(--cui-dark)",
        body: "var(--cui-body-bg)",
        text: "var(--cui-body-color)",
        "tertiary-bg": "var(--cui-tertiary-bg)",
      },

      // 🧩 Tipografía CoreUI + Tailwind
      fontFamily: {
        sans: ["var(--cui-body-font-family)", "Inter", "system-ui", "sans-serif"],
      },

      // 🔁 Transiciones y animaciones personalizadas
      transitionProperty: {
        spacing: "margin, padding",
      },

      // 💡 Sombras suaves y consistentes con CoreUI
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.1)",
        "card-dark": "0 1px 3px rgba(255, 255, 255, 0.1)",
      },
    },
  },

  plugins: [
    // ✨ Plugin opcional para formularios (si lo necesitas)
    require('@tailwindcss/forms'),

    // ✨ Plugin para tipografía avanzada (si usarás textos largos)
    require('@tailwindcss/typography'),
  ],
};

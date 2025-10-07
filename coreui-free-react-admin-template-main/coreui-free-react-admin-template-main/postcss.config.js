module.exports = {
  // 🔧 PostCSS procesa tus estilos antes de compilar (incluyendo Tailwind y SCSS)
  plugins: {
    // 🧩 Tailwind primero, para generar las utilidades CSS
    tailwindcss: {},

    // ⚙️ Autoprefixer añade prefijos de compatibilidad para navegadores antiguos
    autoprefixer: {},

    // ✅ CoreUI ya usa Sass internamente, no es necesario incluir un compilador extra
  },
};

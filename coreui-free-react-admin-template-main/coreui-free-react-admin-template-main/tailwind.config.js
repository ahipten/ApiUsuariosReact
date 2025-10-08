/** @type {import('tailwindcss').Config} */
module.exports = {
  // 🧭 Escaneo de archivos donde Tailwind buscará clases
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/scss/**/*.{scss,sass}",
  ],

  // 🌓 Modo oscuro basado en la preferencia del sistema o clase "dark"
  darkMode: ['class', "class"], // Cambia a 'media' si prefieres que sea automático por sistema

  theme: {
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			success: 'var(--cui-success)',
  			danger: 'var(--cui-danger)',
  			warning: 'var(--cui-warning)',
  			info: 'var(--cui-info)',
  			light: 'var(--cui-light)',
  			dark: 'var(--cui-dark)',
  			body: 'var(--cui-body-bg)',
  			text: 'var(--cui-body-color)',
  			'tertiary-bg': 'var(--cui-tertiary-bg)',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'var(--cui-body-font-family)',
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		transitionProperty: {
  			spacing: 'margin, padding'
  		},
  		boxShadow: {
  			card: '0 1px 3px rgba(0, 0, 0, 0.1)',
  			'card-dark': '0 1px 3px rgba(255, 255, 255, 0.1)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },

  plugins: [
    // ✨ Plugin opcional para formularios (si lo necesitas)
    require('@tailwindcss/forms'),

    // ✨ Plugin para tipografía avanzada (si usarás textos largos)
    require('@tailwindcss/typography'),
      require("tailwindcss-animate")
],
};

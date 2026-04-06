import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0e0e0e",
        surface: "#131313",
        "surface-variant": "#1f1f1f",
        "on-surface": "#e2e2e2",
        "on-surface-variant": "#c6c6c6",
        primary: "#ffffff",
        "on-primary": "#0e0e0e",
        outline: "#333333",
        "outline-variant": "#1f1f1f",
        secondary: "#a3a3a3",
        
        "surface-container-high": "#1f1f1f",
        "surface-container-lowest": "#0e0e0e",
        "surface-container-highest": "#2a2a2a",
        "on-primary-fixed-variant": "#e2e2e2",
        "on-tertiary-fixed": "#e2e2e2",
        "tertiary": "#c6c6c6",
        "secondary-fixed-dim": "#c6c6c6",
        "error": "#ffb4ab",
        "surface-dim": "#0e0e0e",
        "inverse-on-surface": "#131313",
        "on-secondary-fixed-variant": "#e2e2e2",
        "on-error-container": "#ffdad6",
        "tertiary-container": "#1f1f1f",
        "on-primary-fixed": "#0e0e0e",
        "on-tertiary-fixed-variant": "#c6c6c6",
        "primary-container": "#ffffff",
        "inverse-surface": "#ffffff",
        "secondary-fixed": "#ffffff",
        "error-container": "#93000a",
        "surface-bright": "#2a2a2a",
        "on-secondary-fixed": "#0e0e0e",
        "tertiary-fixed": "#ffffff",
        "secondary-container": "#1f1f1f",
        "on-background": "#ffffff",
        "primary-fixed-dim": "#c6c6c6",
        "tertiary-fixed-dim": "#c6c6c6",
        "surface-container": "#131313",
        "on-secondary-container": "#ffffff",
        "on-tertiary": "#0e0e0e",
        "inverse-primary": "#1a1a1a",
        "on-secondary": "#0e0e0e",
        "on-tertiary-container": "#ffffff",
        "surface-container-low": "#0e0e0e",
        "on-error": "#690005",
        "surface-tint": "#ffffff",
        "primary-fixed": "#ffffff",
        "on-primary-container": "#0e0e0e"
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.5rem",
        xl: "0.5rem",
        full: "9999px"
      },
      fontFamily: {
        headline: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [
    forms,
    containerQueries
  ],
}

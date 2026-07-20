/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0F172A", 50: "#f5f7fa", 100: "#e4e9f0" },
        royal: { DEFAULT: "#2563EB", 600: "#1d4ed8", 50: "#eff4ff" },
        emerald: { DEFAULT: "#10B981", 50: "#ecfdf5" },
        card: "#F8FAFC",
      },
      borderRadius: { "2xl": "1.25rem", "3xl": "1.75rem" },
      boxShadow: {
        soft: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)",
        softer: "0 1px 3px rgba(15,23,42,0.05)",
      },
      fontFamily: { sans: ["Inter", "system-ui", "-apple-system", "sans-serif"] },
    },
  },
  plugins: [],
};

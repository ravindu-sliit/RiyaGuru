/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F47C20",
        navy: "#0A1A2F",
        softblue: "#2D74C4",
        gold: "#FFC107",
        success: "#28A745",
        danger: "#DC3545",
        lightgray: "#F5F6FA",
      },
    },
  },
  plugins: [],
};

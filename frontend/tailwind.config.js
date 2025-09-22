/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1A2E40",
        accentYellow: "#FFD60A",
        secondaryBg: "#F5F6FA",
        panel: "#A8D0E6",
        darkText: "#2D2D2D",
        success: "#008C52",
        warning: "#F8D009",
        error: "#D82F2F",
      },
    },
  },
  plugins: [],
};

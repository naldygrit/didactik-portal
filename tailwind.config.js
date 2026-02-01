/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1a1a1a",
        secondary: "#8b7355",
        accent: "#c9a961",
        "bg-alt": "#f8f8f8",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Crimson Pro", "Georgia", "serif"],
      },
      spacing: {
        section: "6rem",
      },
    },
  },
  plugins: [],
};

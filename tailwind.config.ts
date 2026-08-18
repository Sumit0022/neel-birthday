import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          dark: "#0a0a0c",
          light: "#fdfbf7",
        },
        celebration: {
          100: "#fef3c7",
          300: "#fcd34d",
          500: "#f59e0b",
          700: "#f43f5e",
          900: "#be123c",
        },
        royal: {
          gold: "#d4af37",
          maroon: "#4a0404",
          dark: "#1a0000",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        cursive: ["var(--font-cursive)", "cursive"],
        handwriting: ["var(--font-handwriting)", "cursive"],
      },
    },
  },
  plugins: [],
};
export default config;

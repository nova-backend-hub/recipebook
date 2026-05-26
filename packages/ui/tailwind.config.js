/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/web/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/admin/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/ui/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337", // Deep Red (Crimson/Burgundy accent)
          950: "#4c0519",
        },
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "var(--font-display)", "sans-serif"],
      },
      boxShadow: {
        premium: "0 8px 30px rgb(0 0 0 / 0.04)",
        glass: "0 8px 32px 0 rgba(136, 19, 55, 0.05)",
      },
      borderRadius: {
        premium: "1.25rem",
      },
    },
  },
  plugins: [],
}

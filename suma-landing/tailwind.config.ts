import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#05060c",
        foreground: "#f8f9ff",
        primary: {
          DEFAULT: "#6f7dff",
          foreground: "#f5f5ff",
        },
        muted: {
          DEFAULT: "#111426",
          foreground: "#98a2c3",
        },
      },
      borderRadius: {
        xl: "1.25rem",
      },
    },
  },
  plugins: [],
}

export default config

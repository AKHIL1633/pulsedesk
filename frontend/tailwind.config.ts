import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        pulse: {
          50: "#eefcff",
          100: "#d6f6ff",
          400: "#22c3ee",
          500: "#0aa8d6",
          600: "#0584ab",
          700: "#0a6a89",
          900: "#0d3a4a",
        },
      },
      backgroundImage: {
        "pulse-gradient": "linear-gradient(90deg, #0aa8d6 0%, #14b8a6 100%)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        "slow-zoom": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.08)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.45s ease-out both",
        "slide-in-right": "slide-in-right 0.3s ease-out both",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite",
        "slow-zoom": "slow-zoom 20s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};

export default config;

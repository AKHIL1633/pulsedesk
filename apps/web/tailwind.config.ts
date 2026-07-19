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
    },
  },
  plugins: [],
};

export default config;

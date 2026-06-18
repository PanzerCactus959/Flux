import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Deep "ink" base — a financial instrument at night, not pure black.
        ink: {
          900: "#080B16",
          800: "#0B0E1A",
          700: "#11152400",
          base: "#0B0E1A",
        },
        surface: {
          DEFAULT: "#141829",
          raised: "#1B2138",
          line: "#252B45",
        },
        content: {
          hi: "#EAECF5",
          DEFAULT: "#C4C8DC",
          muted: "#8A90A8",
          faint: "#5A6080",
        },
        // The "current" — value moving through a conduit.
        flow: {
          aqua: "#36E0C8", // incoming / streamed
          peri: "#6E8BFF",
          violet: "#B57BFF",
        },
        amber: "#FFB066", // outgoing / sender side
        danger: "#FF6B7A",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: { xl2: "1.25rem" },
      backgroundImage: {
        current: "linear-gradient(90deg, #36E0C8 0%, #6E8BFF 50%, #B57BFF 100%)",
      },
      keyframes: {
        flowMove: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        flow: "flowMove 3s linear infinite",
        fadeUp: "fadeUp 0.4s ease both",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};
export default config;

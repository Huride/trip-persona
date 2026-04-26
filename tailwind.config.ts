import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#222222",
        mist: "#F5F5F5",
        surface: "#FFFFFF",
        line: "#E6E6E6",
        muted: "#707070",
        cyan: {
          50: "#F2F8FF",
          100: "#E3F0FF",
          200: "#D0E6FF",
          500: "#57A9FF",
          800: "#1D8BFF",
          900: "#006CE0"
        },
        ocean: "#1D8BFF"
      }
    }
  },
  plugins: []
};

export default config;

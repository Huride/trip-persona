import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        mist: "#f6f7f8",
        coral: "#ff6b5f",
        ocean: "#1d8f9b"
      }
    }
  },
  plugins: []
};

export default config;

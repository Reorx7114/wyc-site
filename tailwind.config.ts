import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        forest: "#24483A",
        leaf: "#527A67",
        cream: "#FBF7F0",
        blush: "#F6DADD",
        rose: "#D9828B"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(55, 83, 69, 0.10)"
      }
    }
  },
  plugins: []
} satisfies Config;

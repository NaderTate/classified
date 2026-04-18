/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#fafafa",
        card: "#141414",
        border: "#262626",
        input: "#1a1a1a",
        muted: "#171717",
        "muted-foreground": "#a3a3a3",
        primary: "#3b82f6",
        destructive: "#ef4444",
      },
    },
  },
  plugins: [],
};

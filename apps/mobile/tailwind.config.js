/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#ffffff",
        card: "#0a0a0a",
        "card-foreground": "#ffffff",
        border: "#262626",
        input: "#1a1a1a",
        muted: "#171717",
        "muted-foreground": "#a3a3a3",
        primary: "#3b82f6",
        "primary-foreground": "#ffffff",
        destructive: "#ef4444",
        "destructive-foreground": "#ffffff",
        accent: "#1e40af",
      },
    },
  },
  plugins: [],
};

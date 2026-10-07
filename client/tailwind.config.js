export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dce8ff",
          200: "#bfd3ff",
          300: "#91b3ff",
          400: "#5c8cff",
          500: "#386cf5",
          600: "#2452df",
          700: "#203fc0",
          800: "#20379b",
          900: "#20327b",
          950: "#111a3a",
        },
        signal: {
          50: "#fff8e8",
          100: "#ffefc2",
          400: "#f7b938",
          500: "#e69a13",
          700: "#98600c",
        },
      },
      boxShadow: {
        soft: "0 14px 45px rgba(17,26,58,.08)",
        lift: "0 22px 55px rgba(17,26,58,.14)",
        focus: "0 0 0 4px rgba(56,108,245,.2)",
      },
      borderRadius: {
        card: "1.25rem",
      },
    },
  },
  plugins: [],
};

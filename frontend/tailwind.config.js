/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    screens: {
      'xs': '32.5rem',
      'sm': '40rem',
      'md': '48rem',
      'lg': '64rem',
      'xl': '80rem',
      '2xl': '96rem',
      '3xl': '120rem',
    },
    extend: {
      colors: {
        gray: {
          white: "var(--color-gray-white)",
          50: "var(--color-gray-50)",
          100: "var(--color-gray-100)",
          200: "var(--color-gray-200)",
          300: "var(--color-gray-300)",
          400: "var(--color-gray-400)",
          500: "var(--color-gray-500)",
          600: "var(--color-gray-600)",
          700: "var(--color-gray-700)",
          800: "var(--color-gray-800)",
          900: "var(--color-gray-900)",
          black: "var(--color-gray-black)",
        },
        green: {
          50: "var(--color-green-50)",
          100: "var(--color-green-100)",
          200: "var(--color-green-200)",
          300: "var(--color-green-300)",
          400: "var(--color-green-400)",
          500: "var(--color-green-500)",
          600: "var(--color-green-600)",
          700: "var(--color-green-700)",
        },
        point: {
          1: "var(--color-point-1)",
          2: "var(--color-point-2)",
          3: "var(--color-point-3)",
        },
      },
      borderWidth: {
        "custom-s": "0.0875rem",
      },
      borderRadius: {
        "custom-s": "0.25rem",
        "custom-m": "0.5rem",
        "custom-l": "0.875rem",
        "custom-3xl": "3.5rem",
      },
      boxShadow: {
        8: "0 0 0.2rem 0.125rem rgba(182, 182, 182, 0.08)",
        16: "0 0 0.125rem 0.075rem rgba(182, 182, 182, 0.16)",
        24: "0 0 0.4rem 0.15rem rgba(182, 182, 182, 0.24)",
      },
      fontSize: {
        // Bold(700) sizes
        "bold-l": ["1.625rem", { lineHeight: "auto", fontWeight: "700" }],
        "bold-m": ["1.5rem", { lineHeight: "auto", fontWeight: "700" }],
        "bold-r": ["1.25rem", { lineHeight: "auto", fontWeight: "700" }],
        "bold-s": ["1.125rem", { lineHeight: "auto", fontWeight: "700" }],

        // SemiBold(600) sizes
        "semibold-xl": ["1.375rem", { lineHeight: "auto", fontWeight: "600" }],
        "semibold-l": ["1.25rem", { lineHeight: "auto", fontWeight: "600" }],
        "semibold-m": ["1.125rem", { lineHeight: "auto", fontWeight: "600" }],
        "semibold-r": ["1rem", { lineHeight: "auto", fontWeight: "600" }],
        "semibold-s": ["0.8rem", { lineHeight: "auto", fontWeight: "600" }],

        // Medium(500) sizes
        "medium-xl": ["1.25rem", { lineHeight: "auto", fontWeight: "500" }],
        "medium-l": ["1.125rem", { lineHeight: "auto", fontWeight: "500" }],
        "medium-m": ["1rem", { lineHeight: "auto", fontWeight: "500" }],
        "medium-r": ["0.9rem", { lineHeight: "auto", fontWeight: "500" }],
        "medium-s": ["0.875rem", { lineHeight: "auto", fontWeight: "500" }],
        "medium-xs": ["0.75rem", { lineHeight: "auto", fontWeight: "500" }],
      },
      fontFamily: {
        pretendard: ["Pretendard", "sans-serif"],
        raleway: ["Raleway", "sans-serif"],
      },
      spacing: {
        0.1: "0.1rem",
        0.375: "0.375rem",
        "sidebar": "16rem",
        17.5: "17.5rem",
        27.5: "27.5rem",
        42.5: "42.5rem",
        47.5: "47.5rem",
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio')
  ],
};

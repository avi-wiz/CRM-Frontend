/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Semantic color aliases backed by the --wiz-* tokens (tokens.css).
      // NOTE: these are var()-backed, so Tailwind /opacity modifiers do NOT work
      // on them — use the tonal/action token aliases for translucent tints.
      colors: {
        primary: {
          DEFAULT: "var(--wiz-primary-main)",
          light: "var(--wiz-primary-light)",
          dark: "var(--wiz-primary-dark)",
          bg: "var(--wiz-primary-bg)",
        },
        secondary: {
          DEFAULT: "var(--wiz-secondary-main)",
          light: "var(--wiz-secondary-light)",
          dark: "var(--wiz-secondary-dark)",
          bg: "var(--wiz-secondary-bg)",
        },
        success: { DEFAULT: "var(--wiz-success-main)", dark: "var(--wiz-success-dark)", bg: "var(--wiz-success-bg)" },
        danger: { DEFAULT: "var(--wiz-error-main)", dark: "var(--wiz-error-dark)", bg: "var(--wiz-error-bg)" },
        warning: { DEFAULT: "var(--wiz-warning-main)", dark: "var(--wiz-warning-dark)", bg: "var(--wiz-warning-bg)" },
        info: { DEFAULT: "var(--wiz-info-main)", dark: "var(--wiz-info-dark)", bg: "var(--wiz-info-bg)" },

        surface: "var(--wiz-bg-surface)",
        default: "var(--wiz-bg-default)",
        bold: { DEFAULT: "var(--wiz-bg-bold)", hover: "var(--wiz-bg-bold-hover)", pressed: "var(--wiz-bg-bold-pressed)" },

        border: { DEFAULT: "var(--wiz-border-default)", strong: "var(--wiz-border-strong)", focus: "var(--wiz-border-focus)" },
        divider: "var(--wiz-divider)",
        ink: "var(--wiz-text-primary)",
        muted: "var(--wiz-text-secondary)",
        disabled: "var(--wiz-text-disabled)",

        tonal: { DEFAULT: "var(--wiz-tonal-default)", hover: "var(--wiz-tonal-hover)", pressed: "var(--wiz-tonal-pressed)" },
        "action-hover": "var(--wiz-action-hover)",
        "action-selected": "var(--wiz-action-selected)",
      },
      borderRadius: {
        md: "var(--wiz-radius-md)",
        lg: "var(--wiz-radius-lg)",
        xl: "var(--wiz-radius-xl)",
        "2xl": "var(--wiz-radius-2xl)",
        full: "var(--wiz-radius-full)",
      },
      boxShadow: {
        1: "var(--wiz-shadow-1)",
        2: "var(--wiz-shadow-2)",
        3: "var(--wiz-shadow-3)",
        4: "var(--wiz-shadow-4)",
        5: "var(--wiz-shadow-5)",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "Inter", "sans-serif"],
        heading: ['"Plus Jakarta Sans"', "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

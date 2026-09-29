/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0D0E10",
          surface: "#14161A",
          elevated: "#1A1D22",
          subtle: "#101215",
          border: "rgba(255, 255, 255, 0.08)",
          borderHover: "rgba(255, 255, 255, 0.16)",
        },
        paper: {
          DEFAULT: "#EDEAE3",
          muted: "#8B8D93",
          dim: "#5E6066",
        },
        cobalt: {
          DEFAULT: "#3D5AFE",
          hover: "#304FFE",
          subtle: "rgba(61, 90, 254, 0.12)",
          border: "rgba(61, 90, 254, 0.35)",
        },
        accentEmerald: {
          DEFAULT: "#2FBF8F",
          subtle: "rgba(47, 191, 143, 0.12)",
          border: "rgba(47, 191, 143, 0.30)",
        },
        accentAmber: {
          DEFAULT: "#E0A83A",
          subtle: "rgba(224, 168, 58, 0.12)",
          border: "rgba(224, 168, 58, 0.30)",
        },
        accentSteel: {
          DEFAULT: "#5B8DEF",
          subtle: "rgba(91, 141, 239, 0.12)",
          border: "rgba(91, 141, 239, 0.30)",
        },
        accentBrick: {
          DEFAULT: "#D95C5C",
          subtle: "rgba(217, 92, 92, 0.12)",
          border: "rgba(217, 92, 92, 0.30)",
        },
        hairline: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          bright: "rgba(255, 255, 255, 0.16)",
          subtle: "rgba(255, 255, 255, 0.04)",
        }
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Fraunces', 'Instrument Serif', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Manrope', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        card: "6px",
        cardLg: "8px",
        btn: "4px",
        input: "4px",
        tag: "3px",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      backgroundImage: {
        'dot-grid': "radial-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px)",
      },
      backgroundSize: {
        'dot-grid': '24px 24px',
      }
    },
  },
  plugins: [],
};

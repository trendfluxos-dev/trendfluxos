import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          foreground: "hsl(var(--gold-foreground))",
        },
        brand: {
          red: "hsl(var(--primary))",
          "red-hover": "hsl(var(--primary-glow))",
          orange: "hsl(var(--accent-orange))",
          green: "hsl(var(--accent-green))",
        },
        // Fixed-semantic tokens — do not invert in dark mode by design.
        paper: "hsl(var(--paper))",
        scrim: {
          DEFAULT: "hsl(var(--scrim))",
          foreground: "hsl(var(--scrim-foreground))",
        },
        noir: {
          DEFAULT: "hsl(var(--noir))",
          elevated: "hsl(var(--noir-elevated))",
          rim: "hsl(var(--noir-rim))",
        },
        crimson: {
          glow: "hsl(var(--crimson-glow))",
          "glow-strong": "hsl(var(--crimson-glow-strong))",
          rim: "hsl(var(--crimson-rim))",
          mist: "hsl(var(--crimson-mist))",
          blush: "hsl(var(--crimson-blush))",
        },
        wa: {
          green: "hsl(var(--wa-green))",
          "green-glow": "hsl(var(--wa-green-glow))",
          "green-deep": "hsl(var(--wa-green-deep))",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      backgroundImage: {
        "gradient-cyan": "var(--gradient-cyan)",
        "gradient-gold": "var(--gradient-gold)",
        "gradient-hero": "var(--gradient-hero)",
      },
      boxShadow: {
        cyan: "var(--shadow-cyan)",
        gold: "var(--shadow-gold)",
        elegant: "var(--shadow-elegant)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Subtle left→right sheen that sweeps across skeleton blocks.
        // Uses translateX on a gradient overlay (100% wide) inside an
        // overflow-hidden parent, so the sheen enters from the left and
        // exits on the right without repainting the block itself.
        "skeleton-shimmer": {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)"  },
        },
        // Slow ambient float for the background glow orbs behind the
        // glass surface. Keeps the premium dark look alive without
        // becoming distracting.
        "glow-drift": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%":      { transform: "translate3d(2%, -3%, 0) scale(1.05)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "skeleton-shimmer": "skeleton-shimmer 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "glow-drift":      "glow-drift 14s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

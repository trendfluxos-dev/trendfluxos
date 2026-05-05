import type { SVGProps } from "react";

/**
 * Stylized case-study category icons.
 * Pure SVG, currentColor-driven, designed to sit on the dark navy card thumbnail.
 * Each icon uses thin gold strokes + geometric repetition for a McKinsey-meets-startup feel.
 */

type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
  viewBox: "0 0 200 200",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
} as const;

function withA11y(props: IconProps) {
  // If the consumer passes aria-label, expose as a labeled image; otherwise hide decoratively.
  if (props["aria-label"]) {
    return { role: "img" as const, ...props };
  }
  return { "aria-hidden": true as const, focusable: false as const, ...props };
}

const stroke = "hsl(var(--gold))";
const strokeSoft = "hsl(var(--gold) / 0.35)";
const strokeFaint = "hsl(var(--gold) / 0.15)";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Repeating concentric corner accents */}
      <rect x="8" y="8" width="184" height="184" stroke={strokeFaint} strokeWidth="0.6" />
      <rect x="20" y="20" width="160" height="160" stroke={strokeFaint} strokeWidth="0.4" />
      {/* Crosshair guides */}
      <line x1="100" y1="8" x2="100" y2="20" stroke={strokeSoft} strokeWidth="0.5" />
      <line x1="100" y1="180" x2="100" y2="192" stroke={strokeSoft} strokeWidth="0.5" />
      <line x1="8" y1="100" x2="20" y2="100" stroke={strokeSoft} strokeWidth="0.5" />
      <line x1="180" y1="100" x2="192" y2="100" stroke={strokeSoft} strokeWidth="0.5" />
      {children}
    </>
  );
}

export const OrganicGrowthIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <Frame>
      {/* Baseline grid */}
      {[60, 90, 120, 150].map((y) => (
        <line key={y} x1="40" y1={y} x2="160" y2={y} stroke={strokeFaint} strokeWidth="0.4" />
      ))}
      {/* Bars rising */}
      {[
        { x: 50, h: 18 },
        { x: 70, h: 36 },
        { x: 90, h: 54 },
        { x: 110, h: 72 },
        { x: 130, h: 90 },
      ].map((b) => (
        <rect
          key={b.x}
          x={b.x}
          y={150 - b.h}
          width="10"
          height={b.h}
          stroke={strokeSoft}
          strokeWidth="0.8"
        />
      ))}
      {/* Growth arrow */}
      <path
        d="M48 138 L78 116 L108 96 L138 70"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M138 70 L132 78 M138 70 L130 70" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="138" cy="70" r="2.5" fill={stroke} />
    </Frame>
  </svg>
);

export const ContentEngineIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <Frame>
      {/* Stacked content tiles */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={50 + i * 4}
          y={50 + i * 14}
          width="100"
          height="20"
          stroke={i === 2 ? stroke : strokeSoft}
          strokeWidth={i === 2 ? "1.4" : "0.7"}
        />
      ))}
      {/* Tiny content lines on the highlighted tile */}
      <line x1="60" y1="78" x2="120" y2="78" stroke={stroke} strokeWidth="0.6" />
      <line x1="60" y1="82" x2="100" y2="82" stroke={stroke} strokeWidth="0.6" />
    </Frame>
  </svg>
);

export const GlobalStrategyIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <Frame>
      <circle cx="100" cy="100" r="50" stroke={stroke} strokeWidth="1.2" />
      {/* Latitudes */}
      {[80, 100, 120].map((y) => (
        <ellipse key={y} cx="100" cy={y} rx="50" ry="14" stroke={strokeSoft} strokeWidth="0.6" />
      ))}
      {/* Longitudes */}
      {[20, 40].map((rx) => (
        <ellipse key={rx} cx="100" cy="100" rx={rx} ry="50" stroke={strokeSoft} strokeWidth="0.6" />
      ))}
      <line x1="100" y1="50" x2="100" y2="150" stroke={strokeSoft} strokeWidth="0.6" />
      {/* Market nodes */}
      <circle cx="78" cy="86" r="3" fill={stroke} />
      <circle cx="122" cy="92" r="3" fill={stroke} />
      <circle cx="100" cy="118" r="2" fill={stroke} />
      <line x1="78" y1="86" x2="122" y2="92" stroke={stroke} strokeWidth="0.8" strokeDasharray="2 2" />
    </Frame>
  </svg>
);

export const AutomationFunnelIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <Frame>
      {/* Funnel */}
      <path
        d="M55 60 L145 60 L115 110 L115 145 L85 145 L85 110 Z"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Funnel internal stratification */}
      <line x1="65" y1="78" x2="135" y2="78" stroke={strokeSoft} strokeWidth="0.6" />
      <line x1="75" y1="94" x2="125" y2="94" stroke={strokeSoft} strokeWidth="0.6" />
      {/* Inbound dots */}
      {[
        [50, 50],
        [80, 44],
        [110, 46],
        [140, 50],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.6" fill={stroke} />
      ))}
      {/* Output arrow */}
      <path d="M100 150 L100 168" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M100 168 L94 162 M100 168 L106 162" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
    </Frame>
  </svg>
);

export const SmeGrowthIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <Frame>
      {/* Pyramid blueprint */}
      <path d="M60 150 L100 50 L140 150 Z" stroke={stroke} strokeWidth="1.4" />
      <line x1="100" y1="50" x2="100" y2="150" stroke={strokeSoft} strokeWidth="0.6" />
      <line x1="80" y1="100" x2="120" y2="100" stroke={strokeSoft} strokeWidth="0.6" />
      <line x1="70" y1="125" x2="130" y2="125" stroke={strokeSoft} strokeWidth="0.6" />
      {/* Construction crosses */}
      <g stroke={stroke} strokeWidth="0.8">
        <line x1="100" y1="68" x2="100" y2="74" />
        <line x1="97" y1="71" x2="103" y2="71" />
        <line x1="100" y1="98" x2="100" y2="104" />
        <line x1="97" y1="101" x2="103" y2="101" />
      </g>
    </Frame>
  </svg>
);

export const PersonalBrandIcon = (props: IconProps) => (
  <svg {...baseProps} {...props}>
    <Frame>
      {/* Shield */}
      <path
        d="M100 50 L140 64 L140 105 C140 130 122 148 100 156 C78 148 60 130 60 105 L60 64 Z"
        stroke={stroke}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Person silhouette inside */}
      <circle cx="100" cy="92" r="9" stroke={stroke} strokeWidth="1.2" />
      <path
        d="M82 124 C82 112 92 106 100 106 C108 106 118 112 118 124"
        stroke={stroke}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Laurels */}
      {[
        "M48 96 C40 110 40 130 52 144",
        "M152 96 C160 110 160 130 148 144",
      ].map((d, i) => (
        <path key={i} d={d} stroke={strokeSoft} strokeWidth="0.8" />
      ))}
    </Frame>
  </svg>
);

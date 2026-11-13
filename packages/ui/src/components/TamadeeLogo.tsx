import type { JSX, SVGProps } from "react";
import type { BrandThemeVariant } from "../tokens";

export interface TamadeeLogoProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  readonly variant?: BrandThemeVariant;
  readonly withBackground?: boolean;
  readonly title?: string;
}

export function TamadeeLogo({
  variant = "light",
  withBackground = false,
  title = "โลโก้ Tamadee",
  width = 174,
  height = 50,
  ...svgProps
}: TamadeeLogoProps): JSX.Element {
  const isDark = variant === "dark";
  const badgeFill = isDark ? "#F4F4F1" : "#111111";
  const checkStroke = isDark ? "#111111" : "#C6F432";
  const feetFill = isDark ? "#F4F4F1" : "#111111";
  const wordmarkFill = isDark ? "#FFFFFF" : "#111111";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 348 100"
      width={width}
      height={height}
      role="img"
      aria-label={title}
      {...svgProps}
    >
      <title>{title}</title>
      {withBackground ? (
        <rect width="348" height="100" fill={isDark ? "#111111" : "#FFFFFF"} />
      ) : null}
      <g transform="translate(2 4) scale(0.78)">
        <circle cx="60" cy="24" r="15" fill={badgeFill} />
        <path
          d="M52 24l6 6 10-11"
          fill="none"
          stroke={checkStroke}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M26 42 12 26h34l10 16z"
          fill="#FFFFFF"
          stroke="#111111"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M94 42l14-16H74L64 42z"
          fill="#FFFFFF"
          stroke="#111111"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <rect x="18" y="40" width="84" height="64" rx="18" fill="#C6F432" stroke="#111111" strokeWidth="5" />
        <circle cx="45" cy="66" r="5.5" fill="#111111" />
        <circle cx="75" cy="66" r="5.5" fill="#111111" />
        <path d="M49 80q11 10 22 0" fill="none" stroke="#111111" strokeWidth="5" strokeLinecap="round" />
        <rect x="36" y="103" width="16" height="9" rx="4.5" fill={feetFill} />
        <rect x="68" y="103" width="16" height="9" rx="4.5" fill={feetFill} />
      </g>
      <g
        fontFamily="'Space Grotesk', 'Arial Black', Arial, sans-serif"
        fontWeight="700"
        fontSize="52"
        letterSpacing="-1"
      >
        <text x="228" y="68" textAnchor="end" fill={wordmarkFill}>
          tama
        </text>
        <rect x="232" y="22" width="108" height="60" rx="16" fill="#C6F432" />
        <text x="286" y="68" textAnchor="middle" fill="#111111">
          dee
        </text>
      </g>
    </svg>
  );
}

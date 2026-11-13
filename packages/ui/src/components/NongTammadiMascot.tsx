import type { JSX, SVGProps } from "react";
import type { BrandThemeVariant } from "../tokens";

export interface NongTammadiMascotProps extends Omit<SVGProps<SVGSVGElement>, "children" | "width" | "height"> {
  readonly variant?: BrandThemeVariant;
  readonly size?: number;
  readonly title?: string;
}

export function NongTammadiMascot({
  variant = "light",
  size = 120,
  title = "น้องทำมะดิ มาสคอต Tamadee",
  ...svgProps
}: NongTammadiMascotProps): JSX.Element {
  const isDark = variant === "dark";
  const badgeFill = isDark ? "#F4F4F1" : "#111111";
  const checkStroke = isDark ? "#111111" : "#C6F432";
  const feetFill = isDark ? "#F4F4F1" : "#111111";

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      {...svgProps}
    >
      <title>{title}</title>
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
    </svg>
  );
}

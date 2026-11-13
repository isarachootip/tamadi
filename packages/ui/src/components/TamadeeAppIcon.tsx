import type { JSX, SVGProps } from "react";

export interface TamadeeAppIconProps extends Omit<SVGProps<SVGSVGElement>, "children" | "width" | "height"> {
  readonly size?: number;
  readonly title?: string;
}

export function TamadeeAppIcon({
  size = 120,
  title = "ไอคอนแอป Tamadee",
  ...svgProps
}: TamadeeAppIconProps): JSX.Element {
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
      <rect width="120" height="120" rx="28" fill="#C6F432" />
      <g transform="translate(12 10) scale(0.8)">
        <circle cx="60" cy="24" r="15" fill="#111111" />
        <path
          d="M52 24l6 6 10-11"
          fill="none"
          stroke="#C6F432"
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
        <rect x="18" y="40" width="84" height="64" rx="18" fill="#FFFFFF" stroke="#111111" strokeWidth="5" />
        <circle cx="45" cy="66" r="5.5" fill="#111111" />
        <circle cx="75" cy="66" r="5.5" fill="#111111" />
        <path d="M49 80q11 10 22 0" fill="none" stroke="#111111" strokeWidth="5" strokeLinecap="round" />
        <rect x="36" y="103" width="16" height="9" rx="4.5" fill="#111111" />
        <rect x="68" y="103" width="16" height="9" rx="4.5" fill="#111111" />
      </g>
    </svg>
  );
}

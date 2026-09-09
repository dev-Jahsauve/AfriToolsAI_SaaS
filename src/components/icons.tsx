import type { CSSProperties, ReactElement } from "react";

export type IconProps = {
  size?: number;
  active?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function StrokeIcon({ p, children }: { p: IconProps; children: ReactElement }) {
  const size = p.size ?? 16;
  const stroke = p.style?.color ?? (p.active === undefined ? "currentColor" : p.active ? "var(--primary)" : "var(--text-muted)");
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={p.className}
      style={p.style}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* ─── Outils ─── */

export function BoxIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </>
    </StrokeIcon>
  );
}

export function MegaphoneIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <path d="M3 11l18-5v12L3 14v-3z" />
        <path d="M11.6 16.8a3 3 0 11-5.8-1.6" />
      </>
    </StrokeIcon>
  );
}

export function SmartphoneIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <rect x="6" y="2" width="12" height="20" rx="2.5" />
        <line x1="10" y1="18" x2="14" y2="18" />
      </>
    </StrokeIcon>
  );
}

export function MessageCircleIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      </>
    </StrokeIcon>
  );
}

export function TargetIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </>
    </StrokeIcon>
  );
}

/* ─── Navigation ─── */

export function HomeIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    </StrokeIcon>
  );
}

export function HistoryIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <polyline points="12 8 12 12 14 14" />
        <path d="M3.05 11a9 9 0 119.9-8.9M3 4v7h7" />
      </>
    </StrokeIcon>
  );
}

export function UserIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    </StrokeIcon>
  );
}

export function StarIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
    </StrokeIcon>
  );
}

export function WalletIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <path d="M20 12V8H6a2 2 0 01-2-2c0-1.1.9-2 2-2h12v4" />
        <path d="M4 6v12a2 2 0 002 2h14v-4" />
        <path d="M18 12a2 2 0 000 4h4v-4z" />
      </>
    </StrokeIcon>
  );
}

export function LockIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </>
    </StrokeIcon>
  );
}

export function LogOutIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </>
    </StrokeIcon>
  );
}

export function MenuIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <line x1="4" y1="8" x2="20" y2="8" />
        <line x1="4" y1="16" x2="20" y2="16" />
      </>
    </StrokeIcon>
  );
}

export function XIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    </StrokeIcon>
  );
}

export function SunIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </>
    </StrokeIcon>
  );
}

export function MoonIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </StrokeIcon>
  );
}

/* ─── UI courants ─── */

export function ZapIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </StrokeIcon>
  );
}

export function CheckIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <polyline points="20 6 9 17 4 12" />
    </StrokeIcon>
  );
}

export function SparklesIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <path d="M12 3l1.9 5.8a2 2 0 001.3 1.3L21 12l-5.8 1.9a2 2 0 00-1.3 1.3L12 21l-1.9-5.8a2 2 0 00-1.3-1.3L3 12l5.8-1.9a2 2 0 001.3-1.3z" />
        <path d="M19 2v4M17 4h4" />
      </>
    </StrokeIcon>
  );
}

export function RocketIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
        <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </>
    </StrokeIcon>
  );
}

export function InboxIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
        <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
      </>
    </StrokeIcon>
  );
}

export function CrownIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
        <path d="M5 20h14" />
      </>
    </StrokeIcon>
  );
}

export function ArrowRightIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </>
    </StrokeIcon>
  );
}

export function CalculatorIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" />
        <line x1="8" y1="11" x2="8" y2="11.01" />
        <line x1="12" y1="11" x2="12" y2="11.01" />
        <line x1="16" y1="11" x2="16" y2="11.01" />
        <line x1="8" y1="15" x2="16" y2="15" />
      </>
    </StrokeIcon>
  );
}

export function ClockIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    </StrokeIcon>
  );
}

export function FlameIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
    </StrokeIcon>
  );
}

export function TrendDownIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
        <polyline points="17 18 23 18 23 12" />
      </>
    </StrokeIcon>
  );
}

export function AlertCircleIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </>
    </StrokeIcon>
  );
}

export function FileTextIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </>
    </StrokeIcon>
  );
}

export function PenLineIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </>
    </StrokeIcon>
  );
}

export function ShieldIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </StrokeIcon>
  );
}

export function BarChartIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <line x1="12" y1="20" x2="12" y2="10" />
        <line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </>
    </StrokeIcon>
  );
}

export function PlusIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </>
    </StrokeIcon>
  );
}

export function CopyIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </>
    </StrokeIcon>
  );
}

export function GiftIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <path d="M12 8v13" />
        <path d="M19 12v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7" />
        <path d="M7.5 8a2.5 2.5 0 010-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 010 5" />
      </>
    </StrokeIcon>
  );
}

export function KeyIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
      </>
    </StrokeIcon>
  );
}

export function HeartIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </StrokeIcon>
  );
}

export function SpinnerIcon(p: IconProps = {}) {
  return (
    <StrokeIcon p={p}>
      <>
        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
        <path d="M12 2a10 10 0 0110 10" />
      </>
    </StrokeIcon>
  );
}

/* ─── Réseaux sociaux (remplissés) ─── */

export function WhatsAppIcon({ size = 16, className, style }: IconProps = {}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function FacebookIcon({ size = 16, className, style }: IconProps = {}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
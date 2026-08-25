/** Ikon garis ultra-tipis, digambar sendiri — bukan set ikon berstroke tebal. */
type P = { className?: string; strokeWidth?: number };
const base = (c?: string) => `pointer-events-none ${c ?? "h-4 w-4"}`;

const S = ({ children, className, strokeWidth = 1.15 }: P & { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" className={base(className)} aria-hidden="true"
  >
    {children}
  </svg>
);

export const ArrowUpRight = (p: P) => <S {...p}><path d="M7.5 16.5 16.5 7.5M9 7.5h7.5V15" /></S>;
export const ArrowRight = (p: P) => <S {...p}><path d="M4 12h16M14 6l6 6-6 6" /></S>;
export const Ledger = (p: P) => <S {...p}><path d="M5 4.5h11a3 3 0 0 1 3 3v12H8a3 3 0 0 1-3-3V4.5Z" /><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4" /></S>;
export const Layers = (p: P) => <S {...p}><path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8 12 3.5Z" /><path d="m4.5 12 7.5 4 7.5-4M4.5 16l7.5 4 7.5-4" /></S>;
export const Scale = (p: P) => <S {...p}><path d="M12 4v16M7 8h10M6.5 8 4 14h5L6.5 8ZM17.5 8 15 14h5l-2.5-6ZM8.5 20h7" /></S>;
export const Coins = (p: P) => <S {...p}><ellipse cx="12" cy="7" rx="7" ry="3" /><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" /></S>;
export const ShieldCheck = (p: P) => <S {...p}><path d="M12 3.5 5 6v6c0 4 3 7.2 7 8.5 4-1.3 7-4.5 7-8.5V6l-7-2.5Z" /><path d="m9 12 2.2 2.2L15.5 10" /></S>;
export const Search = (p: P) => <S {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></S>;
export const Users = (p: P) => <S {...p}><circle cx="9" cy="8" r="3.5" /><path d="M3 19.5c0-3 2.7-5 6-5s6 2 6 5" /><path d="M16 5.2a3.5 3.5 0 0 1 0 5.6M17.5 14.9c2.1.6 3.5 2.3 3.5 4.6" /></S>;
export const Check = (p: P) => <S {...p}><path d="m5 12.5 4.5 4.5L19 7" /></S>;
export const Cross = (p: P) => <S {...p}><path d="M6 6l12 12M18 6 6 18" /></S>;
export const Info = (p: P) => <S {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5M12 7.8h.01" /></S>;
export const Alert = (p: P) => <S {...p}><path d="M12 4.5 3 19.5h18L12 4.5Z" /><path d="M12 10v4M12 17h.01" /></S>;
export const Link = (p: P) => <S {...p}><path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l3-3a3.54 3.54 0 0 0-5-5l-1.5 1.5" /><path d="M13.5 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.54 3.54 0 0 0 5 5l1.5-1.5" /></S>;
export const Cube = (p: P) => <S {...p}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="M4 7.5 12 12l8-4.5M12 12v9" /></S>;
export const Sparkline = (p: P) => <S {...p}><path d="M3.5 15.5 8 10l3.5 3.5L20 5" /><path d="M3.5 20h17" /></S>;
export const Doc = (p: P) => <S {...p}><path d="M14 3.5H7.5A1.5 1.5 0 0 0 6 5v14a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 19V7.5L14 3.5Z" /><path d="M13.8 3.7V8h4.1" /></S>;
export const Filter = (p: P) => <S {...p}><path d="M4 6.5h16M7 12h10M10 17.5h4" /></S>;
export const Eye = (p: P) => <S {...p}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="3" /></S>;
export const EyeOff = (p: P) => <S {...p}><path d="M3 3l18 18" /><path d="M10.6 5.6C11 5.55 11.5 5.5 12 5.5c6 0 9.5 6.5 9.5 6.5a15.6 15.6 0 0 1-3.1 3.9M6.6 6.6C4 8.3 2.5 12 2.5 12S6 18.5 12 18.5c1.2 0 2.3-.2 3.3-.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></S>;

export const Spinner = ({ className, strokeWidth = 2.25 }: P) => (
  <svg
    viewBox="0 0 24 24" fill="none" aria-hidden="true"
    className={`pointer-events-none animate-spin ${className ?? "h-4 w-4"}`}
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={strokeWidth} strokeOpacity="0.18" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" />
  </svg>
);

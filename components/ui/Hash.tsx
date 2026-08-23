import { pendek } from "@/lib/format";

export function Hash({
  value, href, kepala = 6, ekor = 4, className = "",
}: {
  value: string;
  href?: string;
  kepala?: number;
  ekor?: number;
  className?: string;
}) {
  const isi = (
    <span className={`font-mono text-[12px] tracking-tight text-ink-2 ${className}`}>
      {pendek(value, kepala, ekor)}
    </span>
  );
  if (!href) return isi;
  return (
    <a
      href={href} target="_blank" rel="noreferrer"
      className="inline-flex items-center gap-1.5 underline decoration-ink-4/40 underline-offset-[3px]
        transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:decoration-sage hover:text-sage"
    >
      {isi}
    </a>
  );
}

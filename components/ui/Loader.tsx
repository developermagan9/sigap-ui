import { Spinner } from "./Icons";

export function Loader({
  label,
  size = "md",
  className = "",
}: {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-8 w-8" }[size];
  return (
    <span className={`inline-flex items-center justify-center gap-2.5 ${className}`}>
      <Spinner className={dims} />
      {label && <span className="text-[13px]">{label}</span>}
    </span>
  );
}

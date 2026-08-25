"use client";

import type { ReactNode } from "react";
import { Button } from "./Button";
import { Spinner } from "./Icons";

type Props = {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "ghost" | "quiet";
  icon?: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  /** Saat true: tombol nonaktif dan ikonnya berganti jadi spinner — cegah aksi
   *  terkirim dua kali kalau tombolnya diklik berulang selagi proses berjalan. */
  loading?: boolean;
};

export function LoadingButton({ loading = false, disabled, icon, ...props }: Props) {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      icon={loading ? <Spinner className="h-[15px] w-[15px]" /> : icon}
    />
  );
}

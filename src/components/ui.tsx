import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "warm";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-calm/90 text-night hover:bg-calm shadow-lg shadow-calm/10",
  warm: "bg-gradient-to-r from-orange-400/90 to-rose-400/90 text-night shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40",
  secondary: "border border-mist/15 text-mist/80 hover:border-mist/30 hover:text-white",
  ghost: "text-mist/60 hover:text-white",
};

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: "sm" | "md" }) {
  const sizing = size === "sm" ? "px-3.5 py-1.5 text-sm gap-1.5" : "px-5 py-2.5 gap-2";
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-full font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-calm/70 disabled:pointer-events-none disabled:opacity-35 ${sizing} ${BUTTON_VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

export function Panel({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-3xl border border-mist/10 bg-dusk/60 p-5 sm:p-8 ${className}`}
      {...props}
    />
  );
}

export function Chip({
  selected,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-calm/70 ${
        selected
          ? "border-calm/50 bg-calm/15 text-white"
          : "border-mist/12 text-mist/65 hover:border-mist/30 hover:text-mist"
      } ${className}`}
      {...props}
    />
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      className="h-1 w-full overflow-hidden rounded-full bg-mist/10"
    >
      <div
        className="h-full rounded-full bg-calm/70 transition-[width] duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value * 100))}%` }}
      />
    </div>
  );
}

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm text-mist/70">
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-2xl border border-mist/12 bg-night/60 px-4 py-3 text-slate-100 placeholder:text-mist/30 outline-none transition-colors focus:border-calm/40";

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-mist/40">{children}</p>;
}

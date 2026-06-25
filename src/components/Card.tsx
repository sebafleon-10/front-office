import { type HTMLAttributes, forwardRef } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { padded = true, className = "", children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`fo-card ${padded ? "p-6 sm:p-8" : ""} ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
});

export function CardEyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[12px] font-medium text-[var(--color-text-subtle)] ${className}`.trim()}
    >
      {children}
    </p>
  );
}

export function CardTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`text-[15px] font-medium text-[var(--color-text)] ${className}`.trim()}
    >
      {children}
    </h2>
  );
}

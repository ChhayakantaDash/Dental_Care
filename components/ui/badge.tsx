import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}

export function Badge({ children, variant, className }: BadgeProps) {
  const colorClass = variant ? STATUS_COLORS[variant] || "bg-gray-100 text-gray-800" : "bg-gray-100 text-gray-800";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        colorClass,
        className
      )}
    >
      {children}
    </span>
  );
}

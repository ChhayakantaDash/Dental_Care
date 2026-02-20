import { cn } from "@/lib/utils";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className={cn("w-full text-sm", className)}>{children}</table>
    </div>
  );
}

export function TableHeader({ children, className }: TableProps) {
  return <thead className={cn("bg-secondary", className)}>{children}</thead>;
}

export function TableBody({ children, className }: TableProps) {
  return <tbody className={cn("divide-y divide-border", className)}>{children}</tbody>;
}

export function TableRow({ children, className }: TableProps) {
  return <tr className={cn("hover:bg-muted/50 transition-colors", className)}>{children}</tr>;
}

export function TableHead({ children, className }: TableProps) {
  return (
    <th className={cn("px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider", className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className }: TableProps) {
  return <td className={cn("px-4 py-3 whitespace-nowrap", className)}>{children}</td>;
}

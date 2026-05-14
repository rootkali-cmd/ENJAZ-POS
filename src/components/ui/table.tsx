import { TdHTMLAttributes, ThHTMLAttributes, HTMLAttributes } from "react"

export function Table({ children, className = "", ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm ${className}`} {...props}>{children}</table>
    </div>
  )
}

export function TableHead({ children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className="bg-subtle border-b border-border" {...props}>
      {children}
    </thead>
  )
}

export function TableBody({ children, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className="divide-y divide-border" {...props}>{children}</tbody>
}

export function TableRow({ children, className = "", ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`hover-bg-subtle transition-colors ${className}`} {...props}>{children}</tr>
}

export function TableHeader({ children, className = "", ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`px-4 py-3 text-right text-xs font-medium text-muted uppercase tracking-wider ${className}`} {...props}>
      {children}
    </th>
  )
}

export function TableCell({ children, className = "", ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`px-4 py-3 text-sm text-foreground ${className}`} {...props}>{children}</td>
}

import { Badge } from "@/components/ui/Badge";
import type { CarStatus } from "@/types";

interface StatusBadgeProps {
  status: CarStatus;
}

const config: Record<
  CarStatus,
  { label: string; variant: "default" | "primary" | "success" | "warning" | "danger" | "secondary" }
> = {
  AVAILABLE: { label: "Available", variant: "success" },
  PENDING: { label: "Pending Review", variant: "warning" },
  RESERVED: { label: "Reserved", variant: "primary" },
  SOLD: { label: "Sold", variant: "secondary" },
  REJECTED: { label: "Rejected", variant: "danger" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}

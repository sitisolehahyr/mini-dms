import Badge from "./ui/Badge";

type StatusBadgeProps = {
  status: string;
};

function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toUpperCase();
  const tone =
    normalized === "ACTIVE" || normalized === "APPROVED"
      ? "success"
      : normalized.includes("PENDING")
        ? "warning"
        : normalized === "REJECTED"
          ? "danger"
          : "neutral";

  return <Badge tone={tone}>{normalized.replace(/_/g, " ")}</Badge>;
}

export default StatusBadge;

import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS, POST_STATUS, type Tone } from "@/lib/constants";

export function ProjectStatusBadge({ status }: { status: string }) {
  const meta = PROJECT_STATUS[status] ?? { label: status, tone: "muted" as Tone };
  return (
    <Badge tone={meta.tone} dot={status === "IN_PROGRESS" || status === "COMPLETED"}>
      {meta.label}
    </Badge>
  );
}

export function PostStatusBadge({ status }: { status: string }) {
  const meta = POST_STATUS[status] ?? { label: status, tone: "muted" as Tone };
  return (
    <Badge tone={meta.tone} dot={status === "PUBLISHED"}>
      {meta.label}
    </Badge>
  );
}

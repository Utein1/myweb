import { cn } from "@/lib/utils";
import { skillLevelName } from "@/lib/constants";

const SEGMENTS = [1, 2, 3, 4, 5];

export function SkillMeter({ level, className }: { level: number; className?: string }) {
  const safe = Math.min(5, Math.max(1, level));
  return (
    <div
      className={cn("skill-meter flex items-center gap-1", className)}
      role="img"
      aria-label={`熟练度 ${safe}/5 ${skillLevelName(safe)}`}
    >
      {SEGMENTS.map((segment) => (
        <span
          key={segment}
          aria-hidden
          className={cn("h-1.5 w-5 rounded-[2px]", segment <= safe && "meter-on")}
          style={{
            backgroundColor: segment <= safe ? "var(--gold)" : "var(--border)",
            animationDelay: `${segment * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}

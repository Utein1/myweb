import {
  Github,
  Globe,
  Linkedin,
  Mail,
  MessageCircle,
  Rss,
  Twitter,
  type LucideIcon,
} from "lucide-react";
import type { SocialLink } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  github: Github,
  email: Mail,
  twitter: Twitter,
  linkedin: Linkedin,
  rss: Rss,
  juejin: MessageCircle,
  zhihu: MessageCircle,
  bilibili: MessageCircle,
  website: Globe,
};

export function SocialLinks({
  links,
  className,
  size = 18,
}: {
  links: SocialLink[];
  className?: string;
  size?: number;
}) {
  if (links.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap items-center gap-1", className)}>
      {links.map((link) => {
        const Icon = ICONS[link.platform] ?? Globe;
        const external = /^https?:/.test(link.url);
        return (
          <li key={`${link.platform}-${link.url}`}>
            <a
              href={link.url}
              aria-label={link.label}
              title={link.label}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="inline-flex h-11 w-11 items-center justify-center rounded-[8px] text-muted transition-colors hover:bg-primary-soft hover:text-ink"
            >
              <Icon size={size} aria-hidden />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

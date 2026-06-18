import { LINKS } from "@/lib/links";
import { XIcon, DiscordIcon, GitHubIcon } from "./icons";

const ITEMS = [
  { href: LINKS.x, label: "X", Icon: XIcon },
  { href: LINKS.discord, label: "Discord", Icon: DiscordIcon },
  { href: LINKS.github, label: "GitHub", Icon: GitHubIcon },
];

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {ITEMS.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          className="grid h-9 w-9 place-items-center rounded-lg text-content-muted transition hover:bg-surface-raised hover:text-content-hi"
        >
          <Icon className="h-[18px] w-[18px]" />
        </a>
      ))}
    </div>
  );
}

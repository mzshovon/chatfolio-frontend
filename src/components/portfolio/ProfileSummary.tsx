import { ExternalLink, Download } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { initials } from "@/lib/utils/date";
import { getCvDownloadUrl } from "@/lib/api/publicChat";
import type { ChatfolioPage } from "@/lib/api/types";

interface ProfileSummaryProps {
  data: ChatfolioPage;
}

export function ProfileSummary({ data }: ProfileSummaryProps) {
  const socials = Object.entries(data.social_links ?? {}).filter(
    (entry): entry is [string, string] => Boolean(entry[1])
  );
  const bio = data.intro ?? data.summary;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2.5">
        <Avatar size="lg" label={initials(data.full_name)} />
        <div className="text-lg font-bold text-text-primary">{data.full_name}</div>
        <div className="text-[13px] text-text-secondary">
          {[data.title, data.location].filter(Boolean).join(" · ")}
        </div>

        {socials.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-2">
            {socials.map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-accent transition-colors hover:bg-surface-2"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="capitalize">{platform}</span>
              </a>
            ))}
          </div>
        )}

        <div className="mt-2 flex flex-wrap gap-2.5">
          {data.contact_cta_config && (
            <a
              href={data.contact_cta_config.url}
              className="inline-flex items-center justify-center rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              {data.contact_cta_config.label}
            </a>
          )}
          {data.cv_downloadable && (
            <a
              href={getCvDownloadUrl(data.slug)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-[13px] font-semibold text-text-primary transition-colors hover:bg-surface-2"
            >
              <Download className="h-3.5 w-3.5" />
              Download CV
            </a>
          )}
        </div>
      </div>

      {bio && <p className="text-[13px] leading-relaxed text-text-primary">{bio}</p>}
    </div>
  );
}

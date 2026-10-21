"use client";

import type { ReactNode } from "react";
import { useRecruiter } from "@/components/recruiter/RecruiterProvider";
import { buttonClasses, type ButtonVariant } from "@/components/ui/Button";
import { getCvDownloadUrl } from "@/lib/api/publicChat";
import { firstNameFor } from "@/lib/utils/date";

interface CvDownloadLinkProps {
  slug: string;
  fullName: string;
  variant: ButtonVariant;
  className?: string;
  children: ReactNode;
}

/** Plain link for introduced recruiters; anonymous ones are asked to introduce themselves first. */
export function CvDownloadLink({ slug, fullName, variant, className, children }: CvDownloadLinkProps) {
  const { recruiter, openGate } = useRecruiter();
  const href = getCvDownloadUrl(slug);

  return (
    <a
      href={href}
      onClick={(e) => {
        if (recruiter) return;
        e.preventDefault();
        openGate({
          reason: "cv",
          candidateName: firstNameFor(fullName),
          onDone: () => window.location.assign(href),
        });
      }}
      className={buttonClasses(variant, className)}
    >
      {children}
    </a>
  );
}

import { ExternalLink, ShieldCheck, Store } from "lucide-react";
import type { JSX } from "react";
import type { AccountCopy } from "../../i18n/account-copy";

export interface BackofficePortalSectionProps {
  readonly publicBackendUrl: string;
  readonly copy: AccountCopy;
}

export function BackofficePortalSection({
  publicBackendUrl,
  copy,
}: BackofficePortalSectionProps): JSX.Element {
  const sellerUrl = `${publicBackendUrl}/seller`;
  const adminUrl = `${publicBackendUrl}/dashboard`;

  return (
    <section
      aria-labelledby="backoffice-heading"
      className="space-y-2.5 border-t border-[#E2E2DC] pt-5 dark:border-[#2E2E2B]"
    >
      <h2
        id="backoffice-heading"
        className="text-xs font-extrabold tracking-wide text-[#4A4A45] uppercase dark:text-[#D4D4CE]"
      >
        {copy.backofficeHeading}
      </h2>

      <div className="space-y-2">
        <a
          href={sellerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[60px] items-center justify-between rounded-2xl border border-[#E2E2DC] bg-white px-4 py-3 transition hover:border-[#111111] dark:border-[#2E2E2B] dark:bg-[#1C1C1A] dark:hover:border-[#C6F432]"
        >
          <span className="flex items-center gap-3">
            <Store className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>
              <span className="block text-sm font-extrabold">
                {copy.sellerPortalTitle}
              </span>
              <span className="block text-xs text-[#4A4A45] dark:text-[#D4D4CE]">
                {copy.sellerPortalSub}
              </span>
            </span>
          </span>
          <ExternalLink className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
        </a>

        <a
          href={adminUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[60px] items-center justify-between rounded-2xl border border-[#E2E2DC] bg-white px-4 py-3 transition hover:border-[#111111] dark:border-[#2E2E2B] dark:bg-[#1C1C1A] dark:hover:border-[#C6F432]"
        >
          <span className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>
              <span className="block text-sm font-extrabold">
                {copy.adminPortalTitle}
              </span>
              <span className="block text-xs text-[#4A4A45] dark:text-[#D4D4CE]">
                {copy.adminPortalSub}
              </span>
            </span>
          </span>
          <ExternalLink className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}

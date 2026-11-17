import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { JSX } from "react";
import { AiChatShell } from "../../components/ai/AiChatShell";
import { StorefrontShell } from "../../components/shell/StorefrontShell";
import { listProducts } from "../../data/repositories/catalog-repo";
import { buildPageMetadata } from "../../data/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "ผู้ช่วย AI น้องทำมะดิ",
  description: "ให้ผู้ช่วย AI น้องทำมะดิช่วยจับคู่ชุดและเลือกของขวัญจากสตูดิโอผู้สร้างสรรค์ไทย",
  pathname: "/ai",
});

export default async function AiAssistantPage(): Promise<JSX.Element> {
  const products = await listProducts().catch(() => []);

  return (
    <StorefrontShell
      showBottomNav={false}
      forceDark
      narrowDesktop
      mobileContent={
        <>
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#2E2E2B] bg-[#111111]/95 px-4 backdrop-blur-md">
            <Link
              href="/"
              aria-label="กลับหน้าแรก"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[#1C1C1A] text-white"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
            <h1 className="text-base font-extrabold text-white">
              ผู้ช่วย AI น้องทำมะดิ
            </h1>
            <span className="min-w-[44px]" />
          </header>

          <AiChatShell sampleProducts={products.slice(0, 4)} />
        </>
      }
      desktopContent={
        <div className="rounded-3xl border border-[#2E2E2B] bg-[#161614] p-4">
          <AiChatShell sampleProducts={products.slice(0, 4)} />
        </div>
      }
    />
  );
}

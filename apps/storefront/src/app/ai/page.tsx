import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { JSX } from "react";
import { AiChatShell } from "../../components/ai/AiChatShell";
import { LanguageSwitcher } from "../../components/shared/LanguageSwitcher";
import { StorefrontShell } from "../../components/shell/StorefrontShell";
import { getServerI18n } from "../../data/i18n-server";
import { listProducts } from "../../data/repositories/catalog-repo";
import type { AiRecommendedProduct } from "../../data/schemas/ai-schemas";
import { buildPageMetadata } from "../../data/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "ผู้ช่วย AI น้องทำมะดิ | Nong Tammadi AI",
  description:
    "แชตกับผู้ช่วย AI น้องทำมะดิเพื่อค้นหาเสื้อผ้า รองเท้า กระเป๋า และของขวัญงานคราฟต์จริงจากร้านไทยตามงบประมาณ",
  pathname: "/ai",
});

export default async function AiAssistantPage(): Promise<JSX.Element> {
  const { locale, dict } = await getServerI18n();
  const products = await listProducts({}, locale).catch(() => []);
  const defaultSellerName =
    locale === "en"
      ? "Tamadee Creator"
      : locale === "zh"
        ? "Tamadee 手作主理人"
        : "สตูดิโอทำมาดี";
  const defaultVariantTitle =
    locale === "en" ? "Standard" : locale === "zh" ? "标准款" : "มาตรฐาน";

  const seedCards: AiRecommendedProduct[] = products
    .filter((p) => Boolean(p.primaryOfferId))
    .slice(0, 2)
    .map((p) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      thumbnail: p.thumbnail,
      categoryNames: [...p.categoryNames],
      priceAmount: p.priceAmount,
      offerId: p.primaryOfferId!,
      variantId: p.id,
      variantTitle: defaultVariantTitle,
      sellerId: "seller_tamadee",
      sellerName: defaultSellerName,
    }));

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
              aria-label={dict.nav.home}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[#1C1C1A] text-white"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Link>
            <h1 className="text-sm font-extrabold text-white">
              {dict.ai.pageTitle}
            </h1>
            <LanguageSwitcher compact />
          </header>

          <AiChatShell initialProducts={seedCards} />
        </>
      }
      desktopContent={
        <div className="rounded-3xl border border-[#2E2E2B] bg-[#161614] p-4">
          <AiChatShell initialProducts={seedCards} />
        </div>
      }
    />
  );
}

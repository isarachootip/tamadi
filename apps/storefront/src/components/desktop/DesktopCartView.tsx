import { NongTammadiMascot } from "@tamadee/ui";
import Link from "next/link";
import type { JSX } from "react";
import type { CartSummaryTotals, SellerCartGroup } from "../../domain/types";
import { PromoAndPaymentCard } from "../cart/PromoAndPaymentCard";
import { SellerGroupCard } from "../cart/SellerGroupCard";

export interface DesktopCartViewProps {
  readonly groups: readonly SellerCartGroup[];
  readonly summary: CartSummaryTotals;
  readonly appliedCodes: readonly string[];
  readonly isLoggedIn: boolean;
}

export function DesktopCartView({
  groups,
  summary,
  appliedCodes,
  isLoggedIn,
}: DesktopCartViewProps): JSX.Element {
  if (groups.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-[2rem] bg-[#F1F1EE] px-8 py-16 text-center dark:bg-[#1C1C1A]">
        <NongTammadiMascot size={112} />
        <h1 className="mt-5 text-2xl font-extrabold">
          ตะกร้าสินค้าของคุณยังว่างอยู่
        </h1>
        <p className="mt-1.5 max-w-md text-sm text-[#4A4A45] dark:text-[#D4D4CE]">
          ลองเลือกชมเสื้อผ้าลินิน รองเท้าหนัง หรือเซรามิกทำมือจากสตูดิโอผู้สร้างสรรค์ไทย
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex min-h-[50px] items-center rounded-full bg-[#C6F432] px-8 text-sm font-extrabold text-[#111111]"
        >
          เริ่มเลือกช้อปสินค้า
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">
          ตะกร้าสินค้า ({summary.totalQuantity} ชิ้น)
        </h1>
        <p className="mt-1 text-sm text-[#4A4A45] dark:text-[#D4D4CE]">
          จัดกลุ่มตามร้านค้าผู้ขาย ({groups.length} ร้าน) • ผู้ขายแต่ละร้านจัดส่งแยกพัสดุโดยตรง
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {groups.map((group) => (
            <SellerGroupCard key={group.sellerId} group={group} />
          ))}
        </div>

        <aside className="sticky top-28 lg:col-span-4">
          <PromoAndPaymentCard
            summary={summary}
            appliedCodes={appliedCodes}
            isLoggedIn={isLoggedIn}
          />
        </aside>
      </div>
    </div>
  );
}

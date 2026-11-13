import { ChevronRight, Store, Truck } from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";

export interface SellerInfoCardProps {
  readonly sellerId: string;
  readonly sellerName: string;
  readonly sellerDescription?: string;
  readonly leadtimeDays?: number;
}

export function SellerInfoCard({
  sellerId,
  sellerName,
  sellerDescription,
  leadtimeDays,
}: SellerInfoCardProps): JSX.Element {
  return (
    <div className="rounded-3xl border border-[#E2E2DC] bg-[#F1F1EE] p-4 dark:border-[#2E2E2B] dark:bg-[#1C1C1A]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#111111] text-[#C6F432] dark:bg-[#C6F432] dark:text-[#111111]">
            <Store className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold text-[#4A4A45] dark:text-[#D4D4CE]">
              จำหน่ายและจัดส่งโดย
            </p>
            <h3 className="text-sm font-extrabold">{sellerName}</h3>
          </div>
        </div>
        <Link
          href={`/sellers/${encodeURIComponent(sellerId)}`}
          className="inline-flex min-h-[44px] items-center gap-1 rounded-full bg-white px-3.5 text-xs font-extrabold text-[#111111] shadow-xs transition hover:bg-[#E2E2DC] dark:bg-[#111111] dark:text-[#C6F432]"
        >
          <span>ดูหน้าร้าน</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {sellerDescription ? (
        <p className="mt-2.5 text-xs leading-relaxed text-[#4A4A45] dark:text-[#D4D4CE]">
          {sellerDescription}
        </p>
      ) : null}

      <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#111111] dark:text-white">
        <Truck className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          ผู้ขายจัดส่งเอง • เตรียมจัดส่งภายใน {leadtimeDays ?? 2} วันทำการ (ส่งฟรีเมื่อครบ ฿3,000/ร้าน)
        </span>
      </div>
    </div>
  );
}

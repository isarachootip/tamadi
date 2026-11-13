"use client";

import { Check, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type JSX } from "react";
import { addToCartAction } from "../../actions/cart-actions";
import {
  findMatchingVariant,
  findOfferForVariant,
} from "../../domain/catalog-logic";
import { formatThb } from "../../domain/pricing";
import type { ProductDetail } from "../../domain/types";
import { SellerInfoCard } from "./SellerInfoCard";

export interface VariantPurchasePanelProps {
  readonly detail: ProductDetail;
}

export function VariantPurchasePanel({
  detail,
}: VariantPurchasePanelProps): JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      const firstVar = detail.variants[0];
      for (const opt of detail.options) {
        initial[opt.id] =
          firstVar?.optionValues[opt.id] ?? opt.values[0] ?? "";
      }
      return initial;
    }
  );

  const matchedVariant = findMatchingVariant(detail, selectedOptions);
  const activeOffer = findOfferForVariant(detail, matchedVariant?.id);
  const displayPrice =
    activeOffer?.priceAmount ?? matchedVariant?.priceAmount ?? 0;

  function handleAdd(goToCartAfter: boolean): void {
    if (!activeOffer) {
      setFeedback("สินค้านี้ยังไม่เปิดรับคำสั่งซื้อชั่วคราว");
      return;
    }
    setFeedback(null);
    startTransition(async () => {
      const res = await addToCartAction({
        offerId: activeOffer.id,
        quantity: 1,
        sellerId: activeOffer.sellerId,
        sellerName: activeOffer.sellerName,
      });
      if (!res.ok) {
        setFeedback(res.message ?? "ไม่สามารถเพิ่มลงตะกร้าได้");
        return;
      }
      if (goToCartAfter) {
        router.push("/cart");
      } else {
        setFeedback("เพิ่มสินค้าลงตะกร้าเรียบร้อยแล้ว");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-5 pb-20">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-display text-2xl font-extrabold tracking-tight text-[#111111] dark:text-[#C6F432]">
          {formatThb(displayPrice)}
        </p>
        <span className="text-xs font-bold text-[#4A4A45] dark:text-[#D4D4CE]">
          ราคารวม VAT 7% แล้ว
        </span>
      </div>

      {detail.options.map((opt) => (
        <div key={opt.id} className="space-y-2">
          <h2 className="text-xs font-extrabold tracking-wide uppercase">
            เลือก{opt.title}:{" "}
            <span className="text-[#4A4A45] dark:text-[#D4D4CE]">
              {selectedOptions[opt.id]}
            </span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {opt.values.map((val) => {
              const active = selectedOptions[opt.id] === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() =>
                    setSelectedOptions((prev) => ({ ...prev, [opt.id]: val }))
                  }
                  aria-pressed={active}
                  className={`min-h-[44px] min-w-[52px] rounded-2xl border px-4 text-xs font-extrabold transition ${
                    active
                      ? "border-[#111111] bg-[#111111] text-[#C6F432] dark:border-[#C6F432] dark:bg-[#C6F432] dark:text-[#111111]"
                      : "border-[#E2E2DC] bg-[#F1F1EE] text-[#111111] dark:border-[#2E2E2B] dark:bg-[#1C1C1A] dark:text-white"
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {activeOffer ? (
        <SellerInfoCard
          sellerId={activeOffer.sellerId}
          sellerName={activeOffer.sellerName}
          sellerDescription={activeOffer.sellerDescription}
          leadtimeDays={activeOffer.leadtimeDays}
        />
      ) : null}

      {feedback ? (
        <p
          role="status"
          className="flex items-center gap-1.5 rounded-2xl bg-[#C6F432]/30 px-4 py-2.5 text-xs font-bold text-[#111111] dark:bg-[#C6F432]/20 dark:text-[#C6F432]"
        >
          <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{feedback}</span>
        </p>
      ) : null}

      <div className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[430px] -translate-x-1/2 gap-2.5 border-t border-[#E2E2DC] bg-white/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md dark:border-[#2E2E2B] dark:bg-[#111111]/95">
        <button
          type="button"
          disabled={isPending || !activeOffer}
          onClick={() => handleAdd(false)}
          className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#111111] bg-white px-4 text-sm font-extrabold text-[#111111] transition hover:bg-[#F1F1EE] disabled:opacity-50 dark:border-[#C6F432] dark:bg-[#1C1C1A] dark:text-white"
        >
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          <span>{isPending ? "กำลังเพิ่ม..." : "ใส่ตะกร้า"}</span>
        </button>
        <button
          type="button"
          disabled={isPending || !activeOffer}
          onClick={() => handleAdd(true)}
          className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-2xl bg-[#C6F432] px-4 text-sm font-extrabold text-[#111111] transition hover:brightness-95 disabled:opacity-50"
        >
          ซื้อเลย
        </button>
      </div>
    </div>
  );
}

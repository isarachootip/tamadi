"use client";

import { Banknote, CreditCard, QrCode, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type JSX } from "react";
import { applyPromoCodeAction } from "../../actions/cart-actions";
import { formatThb } from "../../domain/pricing";
import type { CartSummaryTotals } from "../../domain/types";

const PAYMENT_OPTIONS = [
  { id: "promptpay", label: "พร้อมเพย์ QR (ล็อกสต็อก 15 นาที)", Icon: QrCode },
  { id: "card", label: "บัตรเครดิต / เดบิต", Icon: CreditCard },
  { id: "cod", label: "เก็บเงินปลายทาง (แยกตามร้าน)", Icon: Banknote },
] as const;

export interface PromoAndPaymentCardProps {
  readonly summary: CartSummaryTotals;
  readonly appliedCodes: readonly string[];
  readonly isLoggedIn: boolean;
}

export function PromoAndPaymentCard({
  summary,
  appliedCodes,
  isLoggedIn,
}: PromoAndPaymentCardProps): JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [code, setCode] = useState("");
  const [selectedPay, setSelectedPay] = useState<string>("promptpay");
  const [message, setMessage] = useState<string | null>(null);

  function onApplyPromo(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await applyPromoCodeAction(code);
      setMessage(res.message ?? null);
      if (res.ok) {
        setCode("");
        router.refresh();
      }
    });
  }

  function onProceedCheckout(): void {
    if (!isLoggedIn) {
      router.push("/account/login");
      return;
    }
    setMessage(
      "ระบบชำระเงินจริง (Opn Payments พร้อมเพย์ QR / บัตร / COD) จะเปิดใช้งานในระยะที่ 3"
    );
  }

  return (
    <div className="space-y-4 pb-32">
      <form
        onSubmit={onApplyPromo}
        className="flex gap-2 rounded-3xl border border-[#E2E2DC] bg-[#F1F1EE] p-3 dark:border-[#2E2E2B] dark:bg-[#1C1C1A]"
      >
        <label htmlFor="promo-code-input" className="sr-only">
          โค้ดส่วนลด
        </label>
        <div className="relative flex-1">
          <Tag
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#4A4A45] dark:text-[#D4D4CE]"
            aria-hidden="true"
          />
          <input
            id="promo-code-input"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="กรอกโค้ดส่วนลด"
            className="min-h-[44px] w-full rounded-2xl bg-white pr-3 pl-10 text-xs font-bold text-[#111111] placeholder:text-[#4A4A45] dark:bg-[#111111] dark:text-white dark:placeholder:text-[#D4D4CE]"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="min-h-[44px] rounded-2xl bg-[#111111] px-4 text-xs font-extrabold text-[#C6F432] dark:bg-[#C6F432] dark:text-[#111111]"
        >
          ใช้โค้ด
        </button>
      </form>

      {appliedCodes.length > 0 ? (
        <p className="text-xs font-bold text-[#111111] dark:text-[#C6F432]">
          โค้ดที่ใช้แล้ว: {appliedCodes.join(", ")}
        </p>
      ) : null}

      <section aria-labelledby="pay-method-heading" className="space-y-2">
        <h2 id="pay-method-heading" className="text-sm font-extrabold">
          วิธีชำระเงินที่รองรับ
        </h2>
        <div className="space-y-2">
          {PAYMENT_OPTIONS.map(({ id, label, Icon }) => {
            const active = selectedPay === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedPay(id)}
                aria-pressed={active}
                className={`flex min-h-[48px] w-full items-center justify-between rounded-2xl border px-4 text-xs font-bold transition ${
                  active
                    ? "border-[#111111] bg-[#111111] text-[#C6F432] dark:border-[#C6F432] dark:bg-[#C6F432] dark:text-[#111111]"
                    : "border-[#E2E2DC] bg-white text-[#111111] dark:border-[#2E2E2B] dark:bg-[#1C1C1A] dark:text-white"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{label}</span>
                </span>
                <span className="text-[11px] font-extrabold">
                  {active ? "เลือกอยู่" : "เลือก"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section
        aria-label="สรุปยอดชำระ"
        className="space-y-2 rounded-3xl border border-[#E2E2DC] bg-[#F1F1EE] p-4 text-xs font-semibold dark:border-[#2E2E2B] dark:bg-[#1C1C1A]"
      >
        <div className="flex justify-between">
          <span>ยอดรวมสินค้า ({summary.totalQuantity} ชิ้น)</span>
          <span className="font-display font-bold">
            {formatThb(summary.itemSubtotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>ค่าจัดส่งรวมทุกร้าน</span>
          <span className="font-display font-bold">
            {summary.shippingTotal === 0
              ? "ฟรี"
              : formatThb(summary.shippingTotal)}
          </span>
        </div>
        {summary.discountTotal > 0 ? (
          <div className="flex justify-between text-[#15803D] dark:text-[#86EFAC]">
            <span>ส่วนลด</span>
            <span className="font-display font-bold">
              -{formatThb(summary.discountTotal)}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-[#E2E2DC] pt-2 text-sm font-extrabold dark:border-[#2E2E2B]">
          <span>ยอดสุทธิรวม VAT 7%</span>
          <span className="font-display text-base">
            {formatThb(summary.grandTotal)}
          </span>
        </div>
      </section>

      {message ? (
        <p
          role="status"
          className="rounded-2xl bg-[#111111] p-3.5 text-xs font-bold text-[#C6F432] dark:bg-[#C6F432] dark:text-[#111111]"
        >
          {message}
        </p>
      ) : null}

      <div className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[430px] -translate-x-1/2 items-center justify-between gap-3 border-t border-[#E2E2DC] bg-white/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md dark:border-[#2E2E2B] dark:bg-[#111111]/95">
        <div>
          <p className="text-[11px] font-bold text-[#4A4A45] dark:text-[#D4D4CE]">
            ยอดชำระทั้งหมด
          </p>
          <p className="font-display text-lg font-extrabold">
            {formatThb(summary.grandTotal)}
          </p>
        </div>
        <button
          type="button"
          onClick={onProceedCheckout}
          className="min-h-[48px] rounded-2xl bg-[#C6F432] px-6 text-sm font-extrabold text-[#111111] transition hover:brightness-95"
        >
          {isLoggedIn ? "ดำเนินการสั่งซื้อ" : "เข้าสู่ระบบเพื่อสั่งซื้อ"}
        </button>
      </div>
    </div>
  );
}

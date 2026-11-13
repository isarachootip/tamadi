import { NongTammadiMascot } from "@tamadee/ui";
import { ChevronRight, LogOut, MapPin, Package } from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";
import { logoutCustomerAction } from "../../actions/auth-actions";
import { CartIconLink } from "../../components/shared/CartIconLink";
import { TopBackHeader } from "../../components/shared/TopBackHeader";
import { MobileAppShell } from "../../components/shell/MobileAppShell";
import { ThemeModeSelector } from "../../components/theme/ThemeModeSelector";
import { readCustomerToken } from "../../data/cookies";
import { fetchCustomerOrderGroups } from "../../data/repositories/auth-repo";
import { getServerCart, getServerCustomer } from "../../data/session";
import { computeCartSummary, formatThb } from "../../domain/pricing";

export default async function AccountPage(): Promise<JSX.Element> {
  const [customer, cart, token] = await Promise.all([
    getServerCustomer(),
    getServerCart(),
    readCustomerToken(),
  ]);

  const orderGroups = token
    ? await fetchCustomerOrderGroups(token).catch(() => [])
    : [];
  const cartSummary = computeCartSummary(cart);
  const fullName = customer
    ? `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
      customer.email
    : "";

  return (
    <MobileAppShell>
      <TopBackHeader
        title="บัญชีของฉัน"
        rightSlot={<CartIconLink count={cartSummary.totalQuantity} />}
      />

      <div className="space-y-5 px-4 pt-4">
        <section aria-labelledby="theme-heading" className="space-y-2">
          <h2 id="theme-heading" className="text-xs font-extrabold uppercase">
            การแสดงผลหน้าจอ (Light / Dark Mode)
          </h2>
          <ThemeModeSelector />
        </section>

        {!customer ? (
          <section className="rounded-3xl bg-[#111111] p-5 text-white dark:border dark:border-[#2E2E2B] dark:bg-[#1C1C1A]">
            <div className="flex items-center gap-3.5">
              <NongTammadiMascot variant="dark" size={68} />
              <div>
                <h2 className="text-base font-extrabold">
                  ยินดีต้อนรับสู่ Tamadee
                </h2>
                <p className="mt-0.5 text-xs text-[#D4D4CE]">
                  เข้าสู่ระบบเพื่อซิงค์ตะกร้าสินค้า จัดการที่อยู่จัดส่ง และติดตามออเดอร์แยกร้าน
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <Link
                href="/account/login"
                className="flex min-h-[46px] items-center justify-center rounded-2xl bg-[#C6F432] text-xs font-extrabold text-[#111111]"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/account/register"
                className="flex min-h-[46px] items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-xs font-extrabold text-white"
              >
                สมัครสมาชิก
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="rounded-3xl border border-[#E2E2DC] bg-[#F1F1EE] p-4 dark:border-[#2E2E2B] dark:bg-[#1C1C1A]">
              <p className="text-xs font-bold text-[#4A4A45] dark:text-[#D4D4CE]">
                บัญชีสมาชิก Tamadee
              </p>
              <h2 className="mt-0.5 text-lg font-extrabold">{fullName}</h2>
              <p className="text-xs font-medium text-[#4A4A45] dark:text-[#D4D4CE]">
                {customer.email}
              </p>
            </section>

            <Link
              href="/account/addresses"
              className="flex min-h-[60px] items-center justify-between rounded-2xl border border-[#E2E2DC] bg-white px-4 py-3 dark:border-[#2E2E2B] dark:bg-[#1C1C1A]"
            >
              <span className="flex items-center gap-3">
                <MapPin className="h-5 w-5" aria-hidden="true" />
                <span>
                  <span className="block text-sm font-extrabold">
                    ที่อยู่จัดส่งในประเทศไทย
                  </span>
                  <span className="block text-xs text-[#4A4A45] dark:text-[#D4D4CE]">
                    บันทึกแล้ว {customer.addresses.length} ที่อยู่
                  </span>
                </span>
              </span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <section aria-labelledby="orders-heading" className="space-y-2.5">
              <h2
                id="orders-heading"
                className="flex items-center gap-1.5 text-sm font-extrabold"
              >
                <Package className="h-4 w-4" aria-hidden="true" />
                <span>ประวัติคำสั่งซื้อ ({orderGroups.length})</span>
              </h2>
              {orderGroups.length === 0 ? (
                <p className="rounded-2xl bg-[#F1F1EE] p-4 text-xs text-[#4A4A45] dark:bg-[#1C1C1A] dark:text-[#D4D4CE]">
                  ยังไม่มีรายการคำสั่งซื้อ เมื่อสั่งซื้อในระยะที่ 3 ระบบจะแสดงสถานะแยกตามร้านที่นี่
                </p>
              ) : (
                <div className="space-y-2">
                  {orderGroups.map((og) => (
                    <div
                      key={og.id}
                      className="flex items-center justify-between rounded-2xl border border-[#E2E2DC] p-3.5 text-xs dark:border-[#2E2E2B]"
                    >
                      <div>
                        <p className="font-bold">กลุ่มคำสั่งซื้อ #{og.id.slice(-6)}</p>
                        <p className="text-[#4A4A45] dark:text-[#D4D4CE]">
                          แยกเป็น {og.orderCount} ร้านค้า
                        </p>
                      </div>
                      <span className="font-display font-extrabold">
                        {formatThb(og.totalAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <form action={logoutCustomerAction}>
              <button
                type="submit"
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-[#E2E2DC] text-xs font-extrabold text-[#DC2626] dark:border-[#2E2E2B] dark:text-[#FCA5A5]"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>ออกจากระบบ</span>
              </button>
            </form>
          </>
        )}
      </div>
    </MobileAppShell>
  );
}

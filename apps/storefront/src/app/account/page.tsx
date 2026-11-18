import { NongTammadiMascot } from "@tamadee/ui";
import { ChevronRight, Globe, LogOut, MapPin, Package } from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";
import { logoutCustomerAction } from "../../actions/auth-actions";
import { CartIconLink } from "../../components/shared/CartIconLink";
import { LanguageSwitcher } from "../../components/shared/LanguageSwitcher";
import { TopBackHeader } from "../../components/shared/TopBackHeader";
import { StorefrontShell } from "../../components/shell/StorefrontShell";
import { ThemeModeSelector } from "../../components/theme/ThemeModeSelector";
import { readCustomerToken } from "../../data/cookies";
import { getServerI18n } from "../../data/i18n-server";
import { fetchCustomerOrderGroups } from "../../data/repositories/auth-repo";
import { getServerCart, getServerCustomer } from "../../data/session";
import { computeCartSummary } from "../../domain/pricing";
import { ACCOUNT_COPY } from "../../i18n/account-copy";

export default async function AccountPage(): Promise<JSX.Element> {
  const [{ locale, dict, formatPrice }, customer, cart, token] =
    await Promise.all([
      getServerI18n(),
      getServerCustomer(),
      getServerCart(),
      readCustomerToken(),
    ]);

  const copy = ACCOUNT_COPY[locale];
  const orderGroups = token
    ? await fetchCustomerOrderGroups(token).catch(() => [])
    : [];
  const cartSummary = computeCartSummary(cart);
  const fullName = customer
    ? `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
      customer.email
    : "";

  const bodyContent = (
    <div className="space-y-5">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#E2E2DC] bg-[#F1F1EE] p-4 dark:border-[#2E2E2B] dark:bg-[#1C1C1A]">
        <div className="flex items-center gap-2 text-xs font-extrabold">
          <Globe className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{copy.langHeading}</span>
        </div>
        <LanguageSwitcher />
      </section>

      <section aria-labelledby="theme-heading" className="space-y-2">
        <h2 id="theme-heading" className="text-xs font-extrabold uppercase">
          {copy.themeHeading}
        </h2>
        <ThemeModeSelector />
      </section>

      {!customer ? (
        <section className="rounded-3xl bg-[#111111] p-5 text-white dark:border dark:border-[#2E2E2B] dark:bg-[#1C1C1A]">
          <div className="flex items-center gap-3.5">
            <NongTammadiMascot variant="dark" size={68} />
            <div>
              <h2 className="text-base font-extrabold">{copy.welcomeTitle}</h2>
              <p className="mt-0.5 text-xs text-[#D4D4CE]">{copy.welcomeSub}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <Link
              href="/account/login"
              className="flex min-h-[46px] items-center justify-center rounded-2xl bg-[#C6F432] text-xs font-extrabold text-[#111111]"
            >
              {copy.loginBtn}
            </Link>
            <Link
              href="/account/register"
              className="flex min-h-[46px] items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-xs font-extrabold text-white"
            >
              {copy.registerBtn}
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section className="rounded-3xl border border-[#E2E2DC] bg-[#F1F1EE] p-4 dark:border-[#2E2E2B] dark:bg-[#1C1C1A]">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold text-[#4A4A45] dark:text-[#D4D4CE]">
                {copy.memberLabel}
              </p>
              {customer.lineLinked ? (
                <span className="rounded-full bg-[#06C755] px-3 py-0.5 text-[11px] font-extrabold text-white">
                  {copy.lineLinked}
                </span>
              ) : (
                <a
                  href="/api/auth/line/start"
                  className="rounded-full bg-[#06C755] px-3 py-1 text-[11px] font-extrabold text-white"
                >
                  {copy.lineConnect}
                </a>
              )}
            </div>
            <h2 className="mt-1 text-lg font-extrabold">{fullName}</h2>
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
                  {copy.addressTitle}
                </span>
                <span className="block text-xs text-[#4A4A45] dark:text-[#D4D4CE]">
                  {copy.addressSavedPrefix} {customer.addresses.length}
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
              <span>
                {copy.ordersTitle} ({orderGroups.length})
              </span>
            </h2>
            {orderGroups.length === 0 ? (
              <p className="rounded-2xl bg-[#F1F1EE] p-4 text-xs text-[#4A4A45] dark:bg-[#1C1C1A] dark:text-[#D4D4CE]">
                {copy.noOrders}
              </p>
            ) : (
              <div className="space-y-2">
                {orderGroups.map((og) => (
                  <div
                    key={og.id}
                    className="flex items-center justify-between rounded-2xl border border-[#E2E2DC] p-3.5 text-xs dark:border-[#2E2E2B]"
                  >
                    <p className="font-bold">#{og.id.slice(-6)}</p>
                    <span className="font-display font-extrabold">
                      {formatPrice(og.totalAmount)}
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
              <span>{copy.logoutBtn}</span>
            </button>
          </form>
        </>
      )}
    </div>
  );

  return (
    <StorefrontShell
      narrowDesktop
      cartCount={cartSummary.totalQuantity}
      mobileContent={
        <>
          <TopBackHeader
            title={dict.nav.account}
            rightSlot={<CartIconLink count={cartSummary.totalQuantity} />}
          />
          <div className="px-4 pt-4">{bodyContent}</div>
        </>
      }
      desktopContent={
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold">{dict.nav.account}</h1>
          {bodyContent}
        </div>
      }
    />
  );
}

import { MapPin } from "lucide-react";
import { redirect } from "next/navigation";
import type { JSX } from "react";
import { AddressFormCard } from "../../../components/account/AddressFormCard";
import { TopBackHeader } from "../../../components/shared/TopBackHeader";
import { MobileAppShell } from "../../../components/shell/MobileAppShell";
import { getServerCustomer } from "../../../data/session";

export default async function AddressesPage(): Promise<JSX.Element> {
  const customer = await getServerCustomer();
  if (!customer) {
    redirect("/account/login");
  }

  return (
    <MobileAppShell>
      <TopBackHeader title="ที่อยู่จัดส่ง" backHref="/account" />

      <div className="space-y-5 px-4 pt-4">
        <section aria-labelledby="saved-addr-heading" className="space-y-2.5">
          <h2 id="saved-addr-heading" className="text-sm font-extrabold">
            ที่อยู่ที่บันทึกไว้ ({customer.addresses.length})
          </h2>

          {customer.addresses.length === 0 ? (
            <p className="rounded-2xl bg-[#F1F1EE] p-4 text-xs text-[#4A4A45] dark:bg-[#1C1C1A] dark:text-[#D4D4CE]">
              ยังไม่มีที่อยู่จัดส่ง กรอกแบบฟอร์มด้านล่างเพื่อเพิ่มที่อยู่แรกของคุณ
            </p>
          ) : (
            <div className="space-y-2.5">
              {customer.addresses.map((addr) => (
                <article
                  key={addr.id}
                  className="rounded-2xl border border-[#E2E2DC] bg-white p-4 text-xs dark:border-[#2E2E2B] dark:bg-[#1C1C1A]"
                >
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-1.5 text-sm font-extrabold">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                      <span>
                        {addr.firstName} {addr.lastName}
                      </span>
                    </p>
                    {addr.addressName ? (
                      <span className="rounded-full bg-[#C6F432] px-2.5 py-0.5 text-[11px] font-extrabold text-[#111111]">
                        {addr.addressName}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-[#4A4A45] dark:text-[#D4D4CE]">
                    {addr.address1} {addr.city} {addr.province} {addr.postalCode}
                  </p>
                  <p className="mt-0.5 font-semibold">โทร: {addr.phone}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <AddressFormCard />
      </div>
    </MobileAppShell>
  );
}

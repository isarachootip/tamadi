"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, type JSX } from "react";
import { addAddressAction } from "../../actions/auth-actions";

export function AddressFormCard(): JSX.Element {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(addAddressAction, null);

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-3xl border border-[#E2E2DC] bg-[#F1F1EE] p-4 dark:border-[#2E2E2B] dark:bg-[#1C1C1A]"
    >
      <h2 className="text-sm font-extrabold">เพิ่มที่อยู่จัดส่งใหม่</h2>

      <div className="space-y-1">
        <label htmlFor="addr-label" className="block text-xs font-bold">
          ป้ายชื่อที่อยู่ (เช่น บ้าน / ที่ทำงาน)
        </label>
        <input
          id="addr-label"
          name="addressName"
          type="text"
          placeholder="บ้าน"
          className="min-h-[44px] w-full rounded-xl bg-white px-3 text-xs font-medium text-[#111111] dark:bg-[#111111] dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label htmlFor="addr-first" className="block text-xs font-bold">
            ชื่อผู้รับ
          </label>
          <input
            id="addr-first"
            name="firstName"
            type="text"
            required
            className="min-h-[44px] w-full rounded-xl bg-white px-3 text-xs font-medium text-[#111111] dark:bg-[#111111] dark:text-white"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="addr-last" className="block text-xs font-bold">
            นามสกุลผู้รับ
          </label>
          <input
            id="addr-last"
            name="lastName"
            type="text"
            required
            className="min-h-[44px] w-full rounded-xl bg-white px-3 text-xs font-medium text-[#111111] dark:bg-[#111111] dark:text-white"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="addr-line1" className="block text-xs font-bold">
          บ้านเลขที่ ซอย ถนน แขวง/ตำบล
        </label>
        <input
          id="addr-line1"
          name="address1"
          type="text"
          required
          className="min-h-[44px] w-full rounded-xl bg-white px-3 text-xs font-medium text-[#111111] dark:bg-[#111111] dark:text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label htmlFor="addr-city" className="block text-xs font-bold">
            เขต/อำเภอ
          </label>
          <input
            id="addr-city"
            name="city"
            type="text"
            required
            className="min-h-[44px] w-full rounded-xl bg-white px-3 text-xs font-medium text-[#111111] dark:bg-[#111111] dark:text-white"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="addr-prov" className="block text-xs font-bold">
            จังหวัด
          </label>
          <input
            id="addr-prov"
            name="province"
            type="text"
            required
            className="min-h-[44px] w-full rounded-xl bg-white px-3 text-xs font-medium text-[#111111] dark:bg-[#111111] dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label htmlFor="addr-zip" className="block text-xs font-bold">
            รหัสไปรษณีย์
          </label>
          <input
            id="addr-zip"
            name="postalCode"
            type="text"
            required
            minLength={5}
            className="min-h-[44px] w-full rounded-xl bg-white px-3 text-xs font-medium text-[#111111] dark:bg-[#111111] dark:text-white"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="addr-phone" className="block text-xs font-bold">
            เบอร์โทรศัพท์
          </label>
          <input
            id="addr-phone"
            name="phone"
            type="tel"
            required
            className="min-h-[44px] w-full rounded-xl bg-white px-3 text-xs font-medium text-[#111111] dark:bg-[#111111] dark:text-white"
          />
        </div>
      </div>

      {state?.message ? (
        <p
          role="status"
          className={`text-xs font-bold ${
            state.ok
              ? "text-[#15803D] dark:text-[#86EFAC]"
              : "text-[#DC2626] dark:text-[#FCA5A5]"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="min-h-[48px] w-full rounded-2xl bg-[#111111] text-xs font-extrabold text-[#C6F432] dark:bg-[#C6F432] dark:text-[#111111]"
      >
        {isPending ? "กำลังบันทึก..." : "บันทึกที่อยู่จัดส่ง"}
      </button>
    </form>
  );
}

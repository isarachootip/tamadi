"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, type JSX } from "react";
import {
  loginCustomerAction,
  registerCustomerAction,
} from "../../actions/auth-actions";

export function LoginFormCard(): JSX.Element {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    loginCustomerAction,
    null
  );

  useEffect(() => {
    if (state?.ok) {
      router.push("/account");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-3xl border border-[#E2E2DC] bg-[#F1F1EE] p-5 dark:border-[#2E2E2B] dark:bg-[#1C1C1A]"
    >
      <div className="space-y-1.5">
        <label htmlFor="login-email" className="block text-xs font-extrabold">
          อีเมล
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="min-h-[46px] w-full rounded-2xl bg-white px-4 text-sm font-medium text-[#111111] dark:bg-[#111111] dark:text-white"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="login-password" className="block text-xs font-extrabold">
          รหัสผ่าน
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="current-password"
          placeholder="อย่างน้อย 6 ตัวอักษร"
          className="min-h-[46px] w-full rounded-2xl bg-white px-4 text-sm font-medium text-[#111111] dark:bg-[#111111] dark:text-white"
        />
      </div>

      {state && !state.ok && state.message ? (
        <p role="alert" className="text-xs font-bold text-[#DC2626] dark:text-[#FCA5A5]">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="min-h-[48px] w-full rounded-2xl bg-[#C6F432] text-sm font-extrabold text-[#111111] transition hover:brightness-95 disabled:opacity-50"
      >
        {isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>

      <p className="text-center text-xs font-semibold text-[#4A4A45] dark:text-[#D4D4CE]">
        ยังไม่มีบัญชีสมาชิก?{" "}
        <Link
          href="/account/register"
          className="font-extrabold text-[#111111] underline dark:text-[#C6F432]"
        >
          สมัครสมาชิกใหม่
        </Link>
      </p>
    </form>
  );
}

export function RegisterFormCard(): JSX.Element {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    registerCustomerAction,
    null
  );

  useEffect(() => {
    if (state?.ok) {
      router.push("/account");
      router.refresh();
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="space-y-3.5 rounded-3xl border border-[#E2E2DC] bg-[#F1F1EE] p-5 dark:border-[#2E2E2B] dark:bg-[#1C1C1A]"
    >
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-1">
          <label htmlFor="reg-first" className="block text-xs font-extrabold">
            ชื่อ
          </label>
          <input
            id="reg-first"
            name="firstName"
            type="text"
            required
            className="min-h-[44px] w-full rounded-2xl bg-white px-3.5 text-sm font-medium text-[#111111] dark:bg-[#111111] dark:text-white"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="reg-last" className="block text-xs font-extrabold">
            นามสกุล
          </label>
          <input
            id="reg-last"
            name="lastName"
            type="text"
            required
            className="min-h-[44px] w-full rounded-2xl bg-white px-3.5 text-sm font-medium text-[#111111] dark:bg-[#111111] dark:text-white"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="reg-email" className="block text-xs font-extrabold">
          อีเมล
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          required
          className="min-h-[44px] w-full rounded-2xl bg-white px-3.5 text-sm font-medium text-[#111111] dark:bg-[#111111] dark:text-white"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="reg-phone" className="block text-xs font-extrabold">
          เบอร์โทรศัพท์ (ไม่บังคับ)
        </label>
        <input
          id="reg-phone"
          name="phone"
          type="tel"
          placeholder="08X-XXX-XXXX"
          className="min-h-[44px] w-full rounded-2xl bg-white px-3.5 text-sm font-medium text-[#111111] dark:bg-[#111111] dark:text-white"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="reg-pass" className="block text-xs font-extrabold">
          รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
        </label>
        <input
          id="reg-pass"
          name="password"
          type="password"
          required
          minLength={6}
          className="min-h-[44px] w-full rounded-2xl bg-white px-3.5 text-sm font-medium text-[#111111] dark:bg-[#111111] dark:text-white"
        />
      </div>

      {state && !state.ok && state.message ? (
        <p role="alert" className="text-xs font-bold text-[#DC2626] dark:text-[#FCA5A5]">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="min-h-[48px] w-full rounded-2xl bg-[#C6F432] text-sm font-extrabold text-[#111111] transition hover:brightness-95 disabled:opacity-50"
      >
        {isPending ? "กำลังสร้างบัญชี..." : "สมัครสมาชิกและซิงค์ตะกร้า"}
      </button>
    </form>
  );
}

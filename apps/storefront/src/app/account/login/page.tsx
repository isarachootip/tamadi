import type { JSX } from "react";
import { LoginFormCard } from "../../../components/account/AuthForms";
import { LineLoginButton } from "../../../components/account/LineLoginButton";
import { TopBackHeader } from "../../../components/shared/TopBackHeader";
import { StorefrontShell } from "../../../components/shell/StorefrontShell";

interface LoginPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps): Promise<JSX.Element> {
  const params = await searchParams;
  const rawErr = params["line_error"];
  const lineError = typeof rawErr === "string" ? rawErr : undefined;

  const formBody = (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold lg:text-2xl">ยินดีต้อนรับกลับมา</h1>
        <p className="text-xs text-[#4A4A45] lg:text-sm dark:text-[#D4D4CE]">
          เข้าสู่ระบบด้วย LINE เพื่อรับแจ้งเตือนสถานะพัสดุจากน้องทำมะดิ หรือใช้อีเมลของคุณ
        </p>
      </div>
      <LineLoginButton lineError={lineError} />
      <LoginFormCard />
    </div>
  );

  return (
    <StorefrontShell
      narrowDesktop
      mobileContent={
        <>
          <TopBackHeader title="เข้าสู่ระบบ" backHref="/account" />
          <div className="px-4 pt-5">{formBody}</div>
        </>
      }
      desktopContent={<div className="mx-auto max-w-lg py-6">{formBody}</div>}
    />
  );
}

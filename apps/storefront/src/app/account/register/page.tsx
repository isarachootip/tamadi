import type { JSX } from "react";
import { RegisterFormCard } from "../../../components/account/AuthForms";
import { LineLoginButton } from "../../../components/account/LineLoginButton";
import { TopBackHeader } from "../../../components/shared/TopBackHeader";
import { StorefrontShell } from "../../../components/shell/StorefrontShell";

export default function RegisterPage(): JSX.Element {
  const formBody = (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold lg:text-2xl">
          สร้างบัญชีสมาชิก Tamadee
        </h1>
        <p className="text-xs text-[#4A4A45] lg:text-sm dark:text-[#D4D4CE]">
          สมัครด่วนในคลิกเดียวด้วย LINE พร้อมรับแจ้งเตือนพัสดุ หรือกรอกอีเมลด้านล่าง
        </p>
      </div>
      <LineLoginButton />
      <RegisterFormCard />
    </div>
  );

  return (
    <StorefrontShell
      narrowDesktop
      mobileContent={
        <>
          <TopBackHeader title="สมัครสมาชิก" backHref="/account" />
          <div className="px-4 pt-5">{formBody}</div>
        </>
      }
      desktopContent={<div className="mx-auto max-w-lg py-6">{formBody}</div>}
    />
  );
}

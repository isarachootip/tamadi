import type { JSX } from "react";
import { LoginFormCard } from "../../../components/account/AuthForms";
import { TopBackHeader } from "../../../components/shared/TopBackHeader";
import { StorefrontShell } from "../../../components/shell/StorefrontShell";

export default function LoginPage(): JSX.Element {
  const formBody = (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-extrabold lg:text-2xl">ยินดีต้อนรับกลับมา</h1>
        <p className="text-xs text-[#4A4A45] lg:text-sm dark:text-[#D4D4CE]">
          เข้าสู่ระบบเพื่อซิงค์ตะกร้าสินค้าระหว่างเว็บและแอปมือถืออัตโนมัติ
        </p>
      </div>
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

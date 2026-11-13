import type { JSX } from "react";
import { LoginFormCard } from "../../../components/account/AuthForms";
import { TopBackHeader } from "../../../components/shared/TopBackHeader";
import { MobileAppShell } from "../../../components/shell/MobileAppShell";

export default function LoginPage(): JSX.Element {
  return (
    <MobileAppShell>
      <TopBackHeader title="เข้าสู่ระบบ" backHref="/account" />
      <div className="space-y-4 px-4 pt-5">
        <div>
          <h2 className="text-lg font-extrabold">ยินดีต้อนรับกลับมา</h2>
          <p className="text-xs text-[#4A4A45] dark:text-[#D4D4CE]">
            เข้าสู่ระบบเพื่อซิงค์ตะกร้าสินค้าระหว่างเว็บและแอปมือถืออัตโนมัติ
          </p>
        </div>
        <LoginFormCard />
      </div>
    </MobileAppShell>
  );
}

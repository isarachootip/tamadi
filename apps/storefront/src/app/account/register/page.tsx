import type { JSX } from "react";
import { RegisterFormCard } from "../../../components/account/AuthForms";
import { TopBackHeader } from "../../../components/shared/TopBackHeader";
import { MobileAppShell } from "../../../components/shell/MobileAppShell";

export default function RegisterPage(): JSX.Element {
  return (
    <MobileAppShell>
      <TopBackHeader title="สมัครสมาชิก" backHref="/account" />
      <div className="space-y-4 px-4 pt-5">
        <div>
          <h2 className="text-lg font-extrabold">สร้างบัญชีสมาชิก Tamadee</h2>
          <p className="text-xs text-[#4A4A45] dark:text-[#D4D4CE]">
            สมัครฟรี ใช้บัญชีเดียวได้ทั้งบนเว็บ tamdi.tamadee.online และแอปมือถือ
          </p>
        </div>
        <RegisterFormCard />
      </div>
    </MobileAppShell>
  );
}

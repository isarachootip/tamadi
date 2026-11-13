import { NongTammadiMascot } from "@tamadee/ui";
import Link from "next/link";
import type { JSX } from "react";
import { MobileAppShell } from "../components/shell/MobileAppShell";

export default function NotFoundPage(): JSX.Element {
  return (
    <MobileAppShell>
      <div className="flex min-h-[75dvh] flex-col items-center justify-center px-6 text-center">
        <NongTammadiMascot size={96} />
        <h1 className="mt-4 text-xl font-extrabold">ไม่พบหน้าที่คุณต้องการ</h1>
        <p className="mt-1 text-xs text-[#4A4A45] dark:text-[#D4D4CE]">
          ลิงก์อาจถูกย้ายหรือสินค้าชิ้นนี้ไม่ได้เปิดจำหน่ายแล้ว
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex min-h-[48px] items-center rounded-full bg-[#C6F432] px-6 text-xs font-extrabold text-[#111111]"
        >
          กลับสู่หน้าแรก Tamadee
        </Link>
      </div>
    </MobileAppShell>
  );
}

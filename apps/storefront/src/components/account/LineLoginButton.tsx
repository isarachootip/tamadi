import { MessageCircle } from "lucide-react";
import type { JSX } from "react";

export interface LineLoginButtonProps {
  readonly lineError?: string;
}

function mapLineErrorMessage(code: string | undefined): string | null {
  if (!code) return null;
  switch (code) {
    case "not_configured":
      return "ระบบเข้าสู่ระบบด้วย LINE กำลังรอเชื่อมต่อคีย์ LINE OA น้องทำมะดิ กรุณาเข้าสู่ระบบด้วยอีเมลชั่วคราว";
    case "cancelled":
      return "ยกเลิกการเข้าสู่ระบบด้วย LINE แล้ว";
    default:
      return "ไม่สามารถเข้าสู่ระบบด้วย LINE ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";
  }
}

export function LineLoginButton({
  lineError,
}: LineLoginButtonProps): JSX.Element {
  const errorText = mapLineErrorMessage(lineError);
  const enabled =
    (process.env["NEXT_PUBLIC_LINE_LOGIN_ENABLED"] ?? "true") !== "false";

  if (!enabled) {
    return <></>;
  }

  return (
    <div className="space-y-3">
      {errorText ? (
        <p
          role="alert"
          className="rounded-2xl border border-[#F59E0B]/40 bg-[#FEF3C7] px-4 py-3 text-xs font-bold text-[#92400E] dark:bg-[#2A200E] dark:text-[#FDE68A]"
        >
          {errorText}
        </p>
      ) : null}

      <a
        href="/api/auth/line/start"
        className="flex min-h-[50px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#06C755] px-5 text-sm font-extrabold text-white transition hover:brightness-95"
      >
        <MessageCircle className="h-5 w-5 fill-current" aria-hidden="true" />
        <span>เข้าสู่ระบบด้วย LINE (รับแจ้งเตือนออเดอร์)</span>
      </a>

      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-[#E2E2DC] dark:bg-[#2E2E2B]" />
        <span className="text-[11px] font-bold text-[#4A4A45] dark:text-[#9E9E96]">
          หรือใช้อีเมลและรหัสผ่าน
        </span>
        <span className="h-px flex-1 bg-[#E2E2DC] dark:bg-[#2E2E2B]" />
      </div>
    </div>
  );
}

"use client";

import { NongTammadiMascot } from "@tamadee/ui";
import { Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, type JSX } from "react";
import { formatThb } from "../../domain/pricing";
import type { ProductSummary } from "../../domain/types";
import { ProductImage } from "../shared/ProductImage";

const QUICK_PROMPTS = [
  "หาชุดลินินใส่เที่ยวคาเฟ่ งบไม่เกิน 2,500",
  "ของขวัญงานคราฟต์ขึ้นบ้านใหม่",
  "รองเท้าหนังใส่สบายเดินทั้งวัน",
] as const;

export interface AiChatShellProps {
  readonly sampleProducts: readonly ProductSummary[];
}

export function AiChatShell({ sampleProducts }: AiChatShellProps): JSX.Element {
  const [draft, setDraft] = useState("");
  const [activePrompt, setActivePrompt] = useState<string>(QUICK_PROMPTS[0]);
  const [shellNotice, setShellNotice] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (draft.trim().length > 0) {
      setActivePrompt(draft.trim());
      setDraft("");
    }
    setShellNotice(true);
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col justify-between px-4 pt-4 pb-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-3xl border border-[#2E2E2B] bg-[#1C1C1A] p-4">
          <NongTammadiMascot variant="dark" size={56} />
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#C6F432] px-2.5 py-0.5 text-[11px] font-extrabold text-[#111111]">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              AI Stylist & Gift Finder
            </span>
            <h2 className="mt-1 text-sm font-extrabold text-white">
              สวัสดี! เราคือ &ldquo;น้องทำมะดิ&rdquo;
            </h2>
            <p className="text-xs text-[#D4D4CE]">
              บอกโอกาสและงบประมาณมาได้เลย เดี๋ยวช่วยจับคู่ของดีจากร้านไทยให้!
            </p>
          </div>
        </div>

        <div className="ml-auto max-w-[85%] rounded-3xl rounded-tr-md bg-[#C6F432] px-4 py-3 text-xs font-extrabold text-[#111111]">
          {activePrompt}
        </div>

        <div className="space-y-3 rounded-3xl rounded-tl-md border border-[#2E2E2B] bg-[#1C1C1A] p-4">
          <p className="text-xs leading-relaxed font-medium text-[#D4D4CE]">
            ตัวอย่างชุดแนะนำจากแคตตาล็อกจริงของ Tamadee ที่เข้ากับโจทย์ของคุณ:
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {sampleProducts.slice(0, 2).map((item) => (
              <Link
                key={item.id}
                href={`/products/${encodeURIComponent(item.id)}`}
                className="overflow-hidden rounded-2xl border border-[#2E2E2B] bg-[#111111] transition hover:border-[#C6F432]"
              >
                <ProductImage
                  src={item.thumbnail}
                  alt={item.title}
                  sizes="160px"
                />
                <div className="p-2.5">
                  <p className="line-clamp-1 text-xs font-bold text-white">
                    {item.title}
                  </p>
                  <p className="font-display mt-0.5 text-xs font-extrabold text-[#C6F432]">
                    {formatThb(item.priceAmount)}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {shellNotice ? (
            <p
              role="status"
              className="rounded-xl bg-white/10 p-2.5 text-[11px] font-semibold text-[#C6F432]"
            >
              หน้าจอนี้เป็นโครงผู้ช่วย AI สำหรับระยะ 2B — ระบบแชตเชื่อม LLM ค้นสินค้าอัตโนมัติจะเปิดใช้งานจริงในระยะที่ 5
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setActivePrompt(prompt);
                setShellNotice(true);
              }}
              className="min-h-[44px] rounded-full border border-[#2E2E2B] bg-[#1C1C1A] px-3.5 text-xs font-bold text-white transition hover:border-[#C6F432]"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex gap-2">
        <label htmlFor="ai-prompt-input" className="sr-only">
          พิมพ์คำถามถึงน้องทำมะดิ
        </label>
        <input
          id="ai-prompt-input"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="เช่น หาชุดไปทะเลงบไม่เกิน 2,000..."
          className="min-h-[48px] flex-1 rounded-2xl border border-[#2E2E2B] bg-[#1C1C1A] px-4 text-xs font-medium text-white placeholder:text-[#D4D4CE]"
        />
        <button
          type="submit"
          aria-label="ส่งข้อความถามน้องทำมะดิ"
          className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-2xl bg-[#C6F432] text-[#111111]"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

"use client";

import { NongTammadiMascot } from "@tamadee/ui";
import { Loader2, Send, Sparkles } from "lucide-react";
import { useState, useTransition, type JSX } from "react";
import { askNongTammadiAction } from "../../actions/ai-actions";
import type {
  AiHistoryTurn,
  AiRecommendedProduct,
} from "../../data/schemas/ai-schemas";
import { AiProductCard } from "./AiProductCard";

const QUICK_PROMPTS = [
  "หาชุดไปทะเล งบไม่เกิน 2,500",
  "ของขวัญงานคราฟต์ขึ้นบ้านใหม่ งบไม่เกิน 1,000",
  "รองเท้าหนังใส่สบายเดินทั้งวัน",
  "หากระเป๋าผ้าสะพายไปคาเฟ่",
] as const;

interface ChatMessageItem {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly text: string;
  readonly products?: readonly AiRecommendedProduct[];
  readonly isError?: boolean;
}

export interface AiChatShellProps {
  readonly initialProducts: readonly AiRecommendedProduct[];
}

export function AiChatShell({
  initialProducts,
}: AiChatShellProps): JSX.Element {
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const [messages, setMessages] = useState<readonly ChatMessageItem[]>(() => [
    {
      id: "welcome",
      role: "assistant",
      text: "สวัสดีครับ! น้องทำมะดิพร้อมช่วยหาเสื้อผ้า รองเท้า กระเป๋า และของขวัญงานคราฟต์จากร้านไทยแล้ว บอกโอกาสและงบประมาณมาได้เลย (เช่น “หาชุดไปทะเล งบไม่เกิน 2,500”) กดใส่ตะกร้าจากการ์ดได้ทันทีครับ!",
      products: initialProducts.slice(0, 2),
    },
  ]);

  function sendQuestion(rawText: string): void {
    const clean = rawText.trim();
    if (clean.length === 0 || isPending) return;

    const historySnapshot: AiHistoryTurn[] = messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.text,
    }));

    const userMsg: ChatMessageItem = {
      id: `u_${Date.now()}`,
      role: "user",
      text: clean,
    };
    setDraft("");
    setMessages((prev) => [...prev, userMsg]);

    startTransition(async () => {
      const res = await askNongTammadiAction({
        message: clean,
        history: historySnapshot,
      });

      if (!res.ok || !res.data) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            role: "assistant",
            text: res.message ?? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
            isError: true,
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: "assistant",
          text: res.data!.reply,
          products: res.data!.products,
        },
      ]);
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    sendQuestion(draft);
  }

  return (
    <div className="flex min-h-[calc(100dvh-5rem)] flex-col justify-between px-4 pt-4 pb-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-3xl border border-[#2E2E2B] bg-[#1C1C1A] p-4">
          <NongTammadiMascot variant="dark" size={56} />
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#C6F432] px-2.5 py-0.5 text-[11px] font-extrabold text-[#111111]">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Gemini AI Stylist & Real Catalog Search
            </span>
            <h2 className="mt-1 text-sm font-extrabold text-white">
              ผู้ช่วยช้อป &ldquo;น้องทำมะดิ&rdquo;
            </h2>
            <p className="text-xs text-[#D4D4CE]">
              ค้นจากสินค้าและสต็อกจริงในระบบ 100% ไม่มีแต่งราคาปลอม
            </p>
          </div>
        </div>

        <div className="space-y-4" aria-live="polite">
          {messages.map((msg) =>
            msg.role === "user" ? (
              <div
                key={msg.id}
                className="ml-auto w-fit max-w-[85%] rounded-3xl rounded-tr-md bg-[#C6F432] px-4 py-3 text-xs font-extrabold text-[#111111]"
              >
                {msg.text}
              </div>
            ) : (
              <div
                key={msg.id}
                className={`space-y-3 rounded-3xl rounded-tl-md border p-4 ${
                  msg.isError
                    ? "border-[#EF4444]/50 bg-[#2A1515] text-[#FCA5A5]"
                    : "border-[#2E2E2B] bg-[#1C1C1A] text-[#E8E8E3]"
                }`}
              >
                <p className="text-xs leading-relaxed font-medium">{msg.text}</p>
                {msg.products && msg.products.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {msg.products.map((item) => (
                      <AiProductCard key={item.id} product={item} />
                    ))}
                  </div>
                ) : null}
              </div>
            )
          )}

          {isPending ? (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-[#2E2E2B] bg-[#1C1C1A] px-4 py-3 text-xs font-bold text-[#C6F432]">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>น้องทำมะดิกำลังค้นสินค้าจริงในร้านให้...</span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={isPending}
              onClick={() => sendQuestion(prompt)}
              className="min-h-[44px] rounded-full border border-[#2E2E2B] bg-[#1C1C1A] px-3.5 text-xs font-bold text-white transition hover:border-[#C6F432] disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
        <label htmlFor="ai-prompt-input" className="sr-only">
          พิมพ์คำถามถึงน้องทำมะดิ
        </label>
        <input
          id="ai-prompt-input"
          type="text"
          value={draft}
          disabled={isPending}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="เช่น หาชุดไปทะเล งบไม่เกิน 2,500..."
          className="min-h-[48px] flex-1 rounded-2xl border border-[#2E2E2B] bg-[#1C1C1A] px-4 text-xs font-medium text-white placeholder:text-[#D4D4CE] focus:border-[#C6F432] focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending || draft.trim().length === 0}
          aria-label="ส่งข้อความถามน้องทำมะดิ"
          className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-2xl bg-[#C6F432] text-[#111111] disabled:opacity-50"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

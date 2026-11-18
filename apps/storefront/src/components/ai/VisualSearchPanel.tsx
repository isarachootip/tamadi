"use client";

import { Camera, ImageUp, Loader2, Sparkles } from "lucide-react";
import { useRef, useState, useTransition, type JSX } from "react";
import { visualSearchAction } from "../../actions/ai-actions";
import type { VisualSearchResponse } from "../../data/schemas/ai-schemas";
import { compressImageFile } from "../../domain/image-compress";
import { AiProductCard } from "./AiProductCard";

export function VisualSearchPanel(): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [hint, setHint] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<VisualSearchResponse | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleFileSelect(
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    try {
      const compressed = await compressImageFile(file);
      setPreviewUrl(compressed.previewDataUrl);
      const effectiveHint = hint.trim() || compressed.fileNameHint || undefined;

      startTransition(async () => {
        const res = await visualSearchAction({
          imageBase64: compressed.base64,
          mimeType: compressed.mimeType,
          hint: effectiveHint,
        });
        if (!res.ok || !res.data) {
          setErrorMsg(res.message ?? "ไม่สามารถค้นหาสินค้าจากรูปภาพนี้ได้");
          return;
        }
        setResult(res.data);
      });
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "ไม่สามารถประมวลผลรูปภาพได้"
      );
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#2E2E2B] bg-[#161614] p-5 text-white lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#C6F432] px-3 py-0.5 text-[11px] font-extrabold text-[#111111]">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Gemini Vision Search
            </span>
            <h2 className="mt-2 text-lg font-extrabold lg:text-xl">
              ถ่ายรูปหรืออัปโหลดภาพเพื่อหาสินค้าที่คล้ายกัน
            </h2>
            <p className="mt-0.5 text-xs text-[#D4D4CE]">
              ระบบย่อรูปอัตโนมัติในเครื่องคุณก่อนส่ง รวดเร็วและประหยัดอินเทอร์เน็ต
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <label htmlFor="visual-hint-input" className="sr-only">
            คำใบ้เพิ่มเติม (ถ้ามี)
          </label>
          <input
            id="visual-hint-input"
            type="text"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="ระบุรายละเอียดเสริมได้ (ไม่บังคับ) เช่น อยากได้โทนสีครีม..."
            className="min-h-[44px] w-full rounded-2xl border border-[#2E2E2B] bg-[#111111] px-4 text-xs font-medium text-white placeholder:text-[#9E9E96] focus:border-[#C6F432] focus:outline-none"
          />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              void handleFileSelect(e);
            }}
            className="hidden"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#C6F432] px-5 text-xs font-extrabold text-[#111111] transition hover:brightness-95 disabled:opacity-50"
            >
              <Camera className="h-4 w-4" aria-hidden="true" />
              <span>ถ่ายรูป / เลือกรูปจากเครื่อง</span>
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-[#2E2E2B] bg-[#1C1C1A] px-5 text-xs font-extrabold text-white transition hover:border-[#C6F432] disabled:opacity-50"
            >
              <ImageUp className="h-4 w-4 text-[#C6F432]" aria-hidden="true" />
              <span>อัปโหลดภาพตัวอย่างที่แคปไว้</span>
            </button>
          </div>
        </div>

        {previewUrl ? (
          <div className="mt-5 flex items-center gap-4 rounded-2xl border border-[#2E2E2B] bg-[#111111] p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="รูปภาพที่คุณใช้ค้นหา"
              className="h-20 w-20 shrink-0 rounded-xl object-cover"
            />
            <div className="space-y-1">
              <p className="text-xs font-extrabold text-[#C6F432]">
                {isPending ? "กำลังวิเคราะห์ภาพด้วย Gemini Vision..." : "ผลการวิเคราะห์รูปภาพ"}
              </p>
              <p className="text-xs text-[#D4D4CE]">
                {result?.detectedSummary ?? "กรุณารอสักครู่..."}
              </p>
            </div>
          </div>
        ) : null}

        {isPending ? (
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#C6F432]">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>กำลังจับคู่กับสินค้าจริงในสตูดิโอไทย...</span>
          </div>
        ) : null}

        {errorMsg ? (
          <p
            role="alert"
            className="mt-4 rounded-2xl border border-[#EF4444]/40 bg-[#2A1515] px-4 py-3 text-xs font-bold text-[#FCA5A5]"
          >
            {errorMsg}
          </p>
        ) : null}
      </section>

      {result ? (
        <section aria-labelledby="visual-results-heading" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 id="visual-results-heading" className="text-base font-extrabold">
              สินค้าที่คล้ายกับรูปของคุณ ({result.products.length} ชิ้น)
            </h3>
            {result.keywords.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {result.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-full bg-[#F1F1EE] px-2.5 py-0.5 text-[11px] font-bold text-[#111111] dark:bg-[#252522] dark:text-[#C6F432]"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-4">
            {result.products.map((product) => (
              <AiProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

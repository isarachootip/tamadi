import { NongTammadiMascot } from "@tamadee/ui";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import type { JSX } from "react";

export function HomeHeroBanner(): JSX.Element {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden rounded-3xl bg-[#111111] p-5 text-white dark:border dark:border-[#2E2E2B] dark:bg-[#1C1C1A]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2.5">
          <span className="font-display inline-flex items-center gap-1.5 rounded-full bg-[#C6F432] px-3 py-1 text-[11px] font-extrabold tracking-wide text-[#111111] uppercase">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            NEW DROP 2026
          </span>
          <h1
            id="hero-heading"
            className="text-xl leading-tight font-extrabold tracking-tight text-white"
          >
            ทำมาดี ทำมาขาย
            <span className="mt-0.5 block text-sm font-semibold text-[#D4D4CE]">
              คัดของตั้งใจทำจากสตูดิโอไทย ส่งตรงจากผู้สร้างสรรค์
            </span>
          </h1>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href="/products"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[#C6F432] px-4 text-xs font-extrabold text-[#111111] transition hover:brightness-95"
            >
              <span>ช้อปคอลเลกชันใหม่</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/ai"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 text-xs font-bold text-white transition hover:bg-white/15"
            >
              <span>ถามน้องทำมะดิ</span>
            </Link>
          </div>
        </div>

        <div className="shrink-0">
          <NongTammadiMascot variant="dark" size={84} />
        </div>
      </div>
    </section>
  );
}

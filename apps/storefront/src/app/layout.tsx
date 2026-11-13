import type { Metadata, Viewport } from "next";
import { Anuphan, Space_Grotesk } from "next/font/google";
import type { JSX, ReactNode } from "react";
import { ServiceWorkerRegister } from "../components/pwa/ServiceWorkerRegister";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import { WishlistProvider } from "../components/wishlist/WishlistProvider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
});

const anuphan = Anuphan({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-anuphan",
});

export const metadata: Metadata = {
  title: {
    default: "Tamadee — ทำมาดี ทำมาขาย",
    template: "%s | Tamadee",
  },
  description:
    "ตลาดออนไลน์หลายผู้ขายสำหรับสินค้าไทยที่ตั้งใจทำมาดี เสื้อผ้า รองเท้า กระเป๋า เครื่องประดับ และงานคราฟต์",
  applicationName: "Tamadee",
  appleWebApp: {
    capable: true,
    title: "Tamadee",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/app-icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111111",
};

const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem('tamadee_theme_pref')||'light';var d=p==='dark'||(p==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');document.documentElement.dataset.theme='dark';}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  readonly children: ReactNode;
}): JSX.Element {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${anuphan.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <WishlistProvider>
            {children}
            <ServiceWorkerRegister />
          </WishlistProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

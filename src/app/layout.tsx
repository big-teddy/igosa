import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { PostHogProvider } from "@/lib/monitoring/posthog";
import { WebVitals } from "./web-vitals";
import { I18nProvider } from "@/contexts/i18n-context";

export const metadata: Metadata = {
  title: "이거사 - AI 쇼핑 에이전트",
  description: "한국 최초의 AI 네이티브 쇼핑 에이전트 플랫폼",
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script src="https://cdn.iamport.kr/v1/iamport.js" async></script>
      </head>
      <body className="font-sans antialiased">
        <PostHogProvider>


          // ...

          <WebVitals />
          <I18nProvider>
            {children}
          </I18nProvider>
          <Toaster position="top-center" richColors closeButton />
        </PostHogProvider>
      </body>
    </html>
  );
}

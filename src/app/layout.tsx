import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { SessionInitializer } from "@/components/session-initializer";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "BookFlow",
  description: "پلتفرم مدرن مدیریت رزرو",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionInitializer />
        {children}
      </body>
    </html>
  );
}

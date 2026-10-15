import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "@fontsource-variable/estedad";
import { SessionInitializer } from "@/providers/session-initializer";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BarberCRM",
  description: "پلتفرم مدرن مدیریت رزرو",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionInitializer />
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import localFont from "next/font/local";
import { SessionInitializer } from "@/providers/session-initializer";
import "./globals.css";

const modam = localFont({
  src: [
    {
      path: "../fonts/modam/Modam-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../fonts/modam/Modam-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/modam/Modam-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/modam/Modam-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/modam/Modam-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/modam/Modam-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../fonts/modam/Modam-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../fonts/modam/Modam-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-modam",
  display: "swap",
});

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
      className={`${modam.variable} ${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionInitializer />
        {children}
      </body>
    </html>
  );
}

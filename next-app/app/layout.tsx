import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "أُنس | ONS Healthcare",
    template: "%s | أُنس ONS Healthcare",
  },
  description: "أُنس ONS Healthcare — لأن صحتك تستحق الأفضل.",
  applicationName: "ONS Healthcare",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}

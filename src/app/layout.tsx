import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent.Work - AI 职业经纪人",
  description: "重塑你的职业连接",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased font-sans">
        <div className="mx-auto w-[430px] min-h-screen bg-[#FAFAFA] relative overflow-hidden" style={{boxShadow:'0 0 60px rgba(0,0,0,0.08)'}}>
          {children}
        </div>
      </body>
    </html>
  );
}

"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@ant-design/v5-patch-for-react-19";
import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import Login from "@/app/login/page";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/header";
import AppSidebar from "@/components/app-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BodyElement = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      {children}
    </body>
  </html>
);

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  if (pathname.startsWith("/login")) {
    // 判断有没有登录，没有登录跳转登录页面，已登录返回首页
    return (
      <BodyElement>
        <Login />
      </BodyElement>
    );
  }

  return (
    <BodyElement>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <main>
            <Toaster position="top-center" />
            <div className="p-6 bg-gray-50 block min-h-120">
              <AntdRegistry>{children}</AntdRegistry>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </BodyElement>
  );
}

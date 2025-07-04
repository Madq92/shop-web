"use client";

import "@ant-design/v5-patch-for-react-19";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/header";
import AppSidebar from "@/components/app-sidebar";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
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
  );
}

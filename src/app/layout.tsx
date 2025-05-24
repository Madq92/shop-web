"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@ant-design/v5-patch-for-react-19";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AudioWaveform, Command, GalleryVerticalEnd } from "lucide-react";
import { TeamProps } from "@/components/team-switcher";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { useEffect, useState } from "react";
import Login from "@/app/login/page";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { getCurrentUserInfo } from "@/common/utils";
import { UserDTO } from "@/api/sys/UserController";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const teams = [
  {
    name: "Acme Inc",
    logo: GalleryVerticalEnd,
    plan: "Enterprise",
  },
  {
    name: "Acme Corp.",
    logo: AudioWaveform,
    plan: "Startup",
  },
  {
    name: "Evil Corp.",
    logo: Command,
    plan: "Free",
  },
];

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
  const router = useRouter();
  const [user, setUser] = useState<UserDTO>({
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  } as UserDTO);

  useEffect(() => {
    const currentUserInfo = getCurrentUserInfo();
    console.log("currentUserInfo", currentUserInfo);
    if (currentUserInfo) {
      setUser(currentUserInfo);
    }
  }, []);

  console.log("pathname", pathname);

  useEffect(() => {
    console.log("addEventListener", pathname);
    const handleMessage = (event: MessageEvent) => {
      // 可选：验证来源
      // if (event.origin !== 'https://yourdomain.com') return;
      console.log("收到消息:", event.data);
      if (event.data?.relogin) {
        router.push("/login");
      }
      // 根据消息内容处理逻辑
      if (event.data?.type === "error") {
        // 触发错误提示或其他 UI 反馈
        toast.warning(event.data.message);
      }
    };

    window.addEventListener("message", handleMessage);

    // 清理函数
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

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
        <AppSidebar teams={teams as TeamProps[]} user={user} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">parentTitle</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>title</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
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

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
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import { TeamProps } from "@/components/team-switcher";
import { NavMainProps } from "@/components/nav-main";
import { UserProps } from "@/components/nav-user";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { useEffect } from "react";
import { notification } from "antd";
import Login from "@/app/login/page";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const user = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
};

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

const navMain = [
  {
    title: "Playground",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
    items: [
      {
        title: "History",
        url: "#",
      },
      {
        title: "Starred",
        url: "#",
      },
      {
        title: "Settings",
        url: "#",
      },
    ],
  },
  {
    title: "Models",
    url: "#",
    icon: Bot,
    items: [
      {
        title: "Genesis",
        url: "#",
      },
      {
        title: "Explorer",
        url: "#",
      },
      {
        title: "Quantum",
        url: "#",
      },
    ],
  },
  {
    title: "Documentation",
    url: "#",
    icon: BookOpen,
    items: [
      {
        title: "Introduction",
        url: "#",
      },
      {
        title: "Get Started",
        url: "#",
      },
      {
        title: "Tutorials",
        url: "#",
      },
      {
        title: "Changelog",
        url: "#",
      },
    ],
  },
  {
    title: "基础设置",
    url: "/sys",
    icon: Settings2,
    items: [
      {
        title: "用户管理",
        url: "/sys/user",
      },
      {
        title: "角色管理",
        url: "/sys/role",
      },
      {
        title: "资源管理",
        url: "/sys/resource",
      },
      {
        title: "系统配置",
        url: "/sys/config",
      },
    ],
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
  const [api, contextHolder] = notification.useNotification();
  console.log("pathname", pathname);

  useEffect(() => {
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
        api.open({ message: event.data.message });
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

  let parentTitle = "Home";
  let title = "";
  navMain.forEach((item) => {
    for (let i = 0; i < item.items!.length; i++) {
      if (pathname === item.items![i].url) {
        item.isActive = true;
        parentTitle = item.title;
        title = item.items![i].title;
        return;
      } else {
        item.isActive = false;
      }
    }
  });
  return (
    <BodyElement>
      <SidebarProvider>
        <AppSidebar
          teams={teams as TeamProps[]}
          navMain={navMain as NavMainProps[]}
          user={user as UserProps}
        />
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
                    <BreadcrumbLink href="#">{parentTitle}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <main>
            {contextHolder}
            <div className="p-6 bg-gray-50 block min-h-120">
              <AntdRegistry>{children}</AntdRegistry>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </BodyElement>
  );
}

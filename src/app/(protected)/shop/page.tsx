'use client';

import { Separator } from '@/components/ui/separator';
import { Bell, Palette, PanelTop, PocketKnife, User } from 'lucide-react';

const sidebarNavItems = [
  {
    title: 'Profile',
    icon: <User size={18} />,
    href: '/shop',
  },
  {
    title: 'Account',
    icon: <PocketKnife size={18} />,
    href: '/shop/account',
  },
  {
    title: 'Appearance',
    icon: <Palette size={18} />,
    href: '/shop/appearance',
  },
  {
    title: 'Notifications',
    icon: <Bell size={18} />,
    href: '/shop/notifications',
  },
  {
    title: 'Display',
    icon: <PanelTop size={18} />,
    href: '/shop/display',
  },
];
export default function ShopPage() {
  return (
    <>
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and set e-mail preferences.</p>
      </div>
      <Separator className="my-4 lg:my-6" />
      <div className="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12">
        <aside className="top-0 lg:sticky lg:w-1/5">{/*<SidebarNav items={sidebarNavItems} />*/}</aside>
        <div className="flex w-full overflow-y-hidden p-1"></div>
      </div>
    </>
  );
}

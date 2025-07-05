import { cn } from "@/lib/utils";

export default function Box({
  children,
  className,
}: Readonly<{ children: React.ReactNode; className?: string }>) {
  return <div className={cn("bg-white p-6", className)}>{children}</div>;
}

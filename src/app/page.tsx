"use client";
import { useRouter } from "next/navigation";
import React from "react";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  router.push("/sys/user");

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <Link href={"/sys/user"}>home</Link>
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      <div className="w-full"></div>
    </div>
  );
}

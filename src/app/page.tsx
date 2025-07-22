"use client";
import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="grid gap-5 w-full md:w-[1000px] mx-auto">
      <Link href={"/sys/user"}>home</Link>
    </div>
  );
}

'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  router.push('/prod/spu');
  return (
    <div className="grid gap-5 w-full md:w-[1000px] mx-auto">
      <Link href={'/prod/spu'}>home</Link>
    </div>
  );
}

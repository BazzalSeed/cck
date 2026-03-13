"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
      pathname === href
        ? "bg-blue-600 text-white"
        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 mb-6">
      <div className="max-w-5xl mx-auto px-4 flex items-center h-14 gap-6">
        <Image src="/logo.png" alt="CCK" width={80} height={15} priority />
        <div className="flex gap-2">
          <Link href="/" className={linkClass("/")}>
            工单生成
          </Link>
          <Link href="/admin" className={linkClass("/admin")}>
            零件管理
          </Link>
        </div>
      </div>
    </nav>
  );
}

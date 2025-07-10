// src/components/admin/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";
import {
  LayoutDashboard,
  Users,
  FileText,
  Newspaper,
  Calendar,
  Vote,
  Gavel,
  Briefcase,
  Handshake,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/personnel", label: "จัดการบุคลากร", icon: Users },
  { href: "/admin/committees", label: "จัดการคณะกรรมาธิการ", icon: Briefcase },
  { href: "/admin/policies", label: "จัดการนโยบาย", icon: Gavel },
  { href: "/admin/news", label: "จัดการข่าวสาร", icon: Newspaper },
  { href: "/admin/events", label: "จัดการกิจกรรม", icon: Calendar },
  { href: "/admin/meetings", label: "จัดการประชุมสภา", icon: Handshake },
  { href: "/admin/motions", label: "จัดการญัตติ", icon: Vote },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <Link href="/admin/dashboard">
          <h1 className="text-xl font-bold text-gray-800">Relife Party Admin</h1>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-gray-200">
        <LogoutButton />
      </div>
    </aside>
  );
}

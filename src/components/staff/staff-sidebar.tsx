
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  CalendarDays,
  ClipboardList,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

type UserRole = "STAFF" | "ADMIN";

interface StaffSidebarProps {
  role: UserRole;
}

const STAFF_ITEMS = [
  {
    href: "/staff",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/staff/appointments",
    label: "Appointments",
    icon: CalendarDays,
  },
  {
    href: "/staff/appointment-slots",
    label: "Appointment Slots",
    icon: ClipboardList,
  },
  {
    href: "/staff/lab-results",
    label: "Lab Results",
    icon: FlaskConical,
  },
  {
    href: "/staff/services",
    label: "Services",
    icon: Settings,
  },
];

const ADMIN_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/users/new",
    label: "Create Account",
    icon: Users,
  },
  {
    href: "/staff/appointments",
    label: "Appointments",
    icon: CalendarDays,
  },
  {
    href: "/staff/appointment-slots",
    label: "Appointment Slots",
    icon: ClipboardList,
  },
  {
    href: "/staff/lab-results",
    label: "Lab Results",
    icon: FlaskConical,
  },
  {
    href: "/staff/services",
    label: "Services",
    icon: Settings,
  },
];

function NavigationLinks({
  role,
  onNavigate,
}: {
  role: UserRole;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const items = role === "ADMIN" ? ADMIN_ITEMS : STAFF_ITEMS;

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {items.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-clinical-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-clinical-50 hover:text-clinical-700"
            )}
          >
            <item.icon
              className="h-[18px] w-[18px] shrink-0"
              strokeWidth={1.9}
            />

            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
    >
      <LogOut className="h-[18px] w-[18px]" strokeWidth={1.9} />
      Logout
    </button>
  );
}

export function StaffSidebar({ role }: StaffSidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-100 bg-white py-6 lg:flex">
      <div className="px-5 pb-6">
        <Logo />
      </div>

      <NavigationLinks role={role} />

      <div className="px-3 pt-4">
        <LogoutButton />
      </div>
    </aside>
  );
}

export function StaffMobileNav({ role }: StaffSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-slate-100 bg-white px-4 py-3 lg:hidden">
      <div className="flex items-center justify-between">
        <Logo iconClassName="h-8 w-8" />

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          />

          <div className="relative flex w-[min(18rem,85vw)] flex-col bg-white py-6 shadow-xl">
            <div className="flex items-center justify-between px-5 pb-6">
              <Logo />

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <NavigationLinks
              role={role}
              onNavigate={() => setOpen(false)}
            />

            <div className="px-3 pt-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


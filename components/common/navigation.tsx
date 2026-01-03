"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Plus, BarChart3, User, Wallet, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/groups", icon: Users, label: "Groups" },
    { href: "/add-expense", icon: Plus, label: "Add Expense" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white">
            <Wallet size={18} />
          </div>
          <span className="text-xl font-bold font-poppins text-primary">SplitSmart</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          if (!Icon) return null;
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-foreground/60 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/60 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/groups", icon: Users, label: "Groups" },
    { href: "/add-expense", icon: Plus, label: "Add", isCenter: true },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden">
      <div className="relative">
        {/* CENTER ACTION BUTTON - Redesigned with custom borders and positioning */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-7 z-[110]">
          <Link
            href="/add-expense"
            className="relative flex items-center justify-center group"
          >
            {/* Outer Soft Glow Layer */}
            <div className="absolute -inset-4 bg-primary/25 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Multi-layered Border Effect */}
            <div className="relative flex items-center justify-center">
              {/* Layer 3: Dynamic Rotation Ring */}
              <div className="absolute -inset-[2px] rounded-full bg-gradient-to-tr from-primary via-secondary to-accent opacity-70 group-hover:animate-spin-slow transition-opacity duration-500" />

              {/* Layer 2: Glass White Border */}
              <div className="absolute -inset-[1px] rounded-full bg-white dark:bg-slate-800" />

              {/* Layer 1: The Main Button Body */}
              <div className="relative w-14 h-14 bg-gradient-to-br from-primary via-indigo-600 to-secondary rounded-full shadow-[0_10px_20px_-5px_rgba(99,102,241,0.5)] flex items-center justify-center transition-all duration-300 group-hover:scale-105 active:scale-90 overflow-hidden">
                {/* Internal Radial Light Source */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent)]" />

                <Plus size={32} className="text-white relative z-10 group-hover:rotate-180 transition-transform duration-700" />
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Bar Body - Minimalist & Premium */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center pt-2.5 pb-8 px-8 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] rounded-t-[3rem]">
          {navItems.map(({ href, icon: Icon, label, isCenter }) => {
            const isActive = pathname === href;

            if (isCenter) {
              return <div key="spacer" className="w-14 h-10" />;
            }

            if (!Icon) return null;

            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${isActive ? "text-primary -translate-y-1" : "text-foreground/30"
                  }`}
              >
                <div className={`transition-all duration-300 ${isActive ? "scale-110" : "scale-100"}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                  }`}>
                  {label}
                </span>

                {/* Active Indicator Dot */}
                {isActive && (
                  <div className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full animate-in zoom-in" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function Navigation() {
  return (
    <>
      <Sidebar />
      <BottomNav />
    </>
  );
}
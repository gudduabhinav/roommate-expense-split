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
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden h-[90px] pointer-events-none">
      <div className="relative w-full h-full flex items-end justify-center">
        {/* 
          Vibrant Dark Notched Background 
          Color: Deep Slate/Indigo for a premium dark look
        */}
        <div className="absolute inset-x-0 bottom-0 top-6 text-[#1e293b] dark:text-[#0f172a] pointer-events-auto">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="filter drop-shadow-[0_-5px_20px_rgba(0,0,0,0.3)]"
          >
            <path
              d="M0,0 L32,0 
                 C38,0 38,20 50,20 
                 C62,20 62,0 68,0 
                 L100,0 L100,100 L0,100 Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* 
          The Floating Center Button 
          Gold/Primary contrast against the dark bar
        */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 z-20 pointer-events-auto">
          <Link
            href="/add-expense"
            className="flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-[#6366f1] via-[#818cf8] to-[#60a5fa] rounded-full shadow-[0_8px_30px_rgba(99,102,241,0.5)] border-4 border-[#1e293b] dark:border-[#0f172a] hover:scale-110 active:scale-90 transition-all group"
          >
            <Plus size={36} className="text-white group-hover:rotate-90 transition-transform duration-500" />
            {/* Animated Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        {/* Icons Area - White/Light icons for Dark Theme */}
        <div className="relative z-10 w-full flex justify-between items-center px-4 pb-6 h-16 pointer-events-auto">
          {/* Left pair */}
          <div className="flex justify-around flex-1 items-center">
            {navItems.slice(0, 2).map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center gap-1 transition-all flex-grow ${isActive ? "text-white scale-110" : "text-white/40 hover:text-white/70"
                    }`}
                >
                  <div className={`p-1.5 rounded-xl transition-colors ${isActive ? "bg-white/10" : ""}`}>
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-[0.1em] ${isActive ? "opacity-100" : "opacity-60"}`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Spacer for the Notch */}
          <div className="w-16 h-1" />

          {/* Right pair */}
          <div className="flex justify-around flex-1 items-center">
            {navItems.slice(3).map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center gap-1 transition-all flex-grow ${isActive ? "text-white scale-110" : "text-white/40 hover:text-white/70"
                    }`}
                >
                  <div className={`p-1.5 rounded-xl transition-colors ${isActive ? "bg-white/10" : ""}`}>
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-[0.1em] ${isActive ? "opacity-100" : "opacity-60"}`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
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
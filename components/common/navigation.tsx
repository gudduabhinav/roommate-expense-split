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
          if (!Icon) return null; // Safety check
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
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
        <div className="absolute left-1/2 -translate-x-1/2 -top-8 z-[110]">
          <Link
            href="/add-expense"
            className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary via-indigo-600 to-secondary rounded-full shadow-[0_8px_25px_-5px_rgba(99,102,241,0.5)] border-4 border-white dark:border-slate-900 transition-all duration-300 hover:scale-110 active:scale-95 group"
          >
            <Plus size={32} className="text-white group-hover:rotate-90 transition-transform duration-300" />
            <div className="absolute -inset-2 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
          </Link>
        </div>

        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 flex justify-around items-center py-3 px-2 pb-safe shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
          {navItems.map(({ href, icon: Icon, label, isCenter }) => {
            const isActive = pathname === href;

            if (isCenter) {
              return <div key="spacer" className="w-16 h-10" />;
            }

            if (!Icon) return null; // Safety check

            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 transition-all duration-200 ${isActive
                    ? "text-primary scale-110"
                    : "text-foreground/40 hover:text-foreground/60"
                  }`}
              >
                <div className={`p-1.5 rounded-xl ${isActive ? "bg-primary/10" : "bg-transparent"}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? "opacity-100" : "opacity-0"}`}>
                  {label}
                </span>
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
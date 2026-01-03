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
        {/* CENTER ACTION BUTTON */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-10 z-[110]">
          <Link
            href="/add-expense"
            className="relative flex items-center justify-center group"
          >
            {/* Pulsing Outer Ring */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full blur-md opacity-40 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 animate-pulse" />

            {/* The Main Button */}
            <div className="relative w-16 h-16 bg-gradient-to-tr from-primary via-indigo-600 to-secondary rounded-full border-[3px] border-white dark:border-slate-900 shadow-[0_10px_25px_-5px_rgba(99,102,241,0.6)] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1 group-active:scale-90 overflow-hidden">
              {/* Internal Shine Effect */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20 -skew-y-12 translate-y-[-50%] group-hover:translate-y-[100%] transition-transform duration-700" />

              <Plus size={36} className="text-white group-hover:rotate-90 transition-transform duration-500" />
            </div>

            {/* Label for center button (optional, but makes it consistent) */}
            <span className="absolute -bottom-7 text-[10px] font-black text-primary uppercase tracking-tighter opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
              Add Item
            </span>
          </Link>
        </div>

        {/* Navigation Bar Body */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-200/40 dark:border-slate-800/40 flex justify-around items-center pt-3 pb-6 px-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] rounded-t-[2.5rem]">
          {navItems.map(({ href, icon: Icon, label, isCenter }) => {
            const isActive = pathname === href;

            if (isCenter) {
              return <div key="spacer" className="w-16 h-10" />;
            }

            if (!Icon) return null;

            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 group/item transition-all duration-200 ${isActive
                    ? "text-primary translate-y-[-2px]"
                    : "text-foreground/30 hover:text-foreground/60"
                  }`}
              >
                <div className={`p-2 rounded-[1.2rem] transition-all duration-300 ${isActive
                    ? "bg-primary/10 shadow-inner"
                    : "bg-transparent group-hover/item:bg-slate-100 dark:group-hover/item:bg-slate-800"
                  }`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="transition-transform duration-300 group-hover/item:scale-110" />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-300 ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-75"
                  }`}>
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
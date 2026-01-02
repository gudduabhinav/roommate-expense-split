"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, PlusCircle, BarChart3, User } from "lucide-react";

const navItems = [
    { icon: Home, label: "Home", href: "/dashboard" },
    { icon: Users, label: "Groups", href: "/groups" },
    { icon: PlusCircle, label: "Add", href: "/add-expense", primary: true },
    { icon: BarChart3, label: "Insights", href: "/analytics" },
    { icon: User, label: "Profile", href: "/profile" },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-slate-900/80 border-t border-slate-200/50 dark:border-slate-800/50 px-6 py-3 pb-8 md:hidden z-50 flex justify-between items-center backdrop-blur-xl shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                if (item.primary) {
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="bg-primary text-white p-4 rounded-2xl -mt-14 card-shadow hover:scale-110 active:scale-95 transition-all flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg shadow-primary/30"
                        >
                            <Icon size={24} strokeWidth={2.5} />
                        </Link>
                    );
                }

                return (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    >
                        <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-primary/10' : ''}`}>
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider font-bold ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 sticky top-0">
            <div className="flex items-center gap-2 mb-12">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                    S
                </div>
                <span className="text-xl font-bold font-poppins text-primary">SplitSmart</span>
            </div>

            <nav className="space-y-3 flex-grow">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    if (item.primary) return null;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all duration-300 group ${isActive ? 'bg-primary text-white card-shadow scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary'}`}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'group-hover:text-primary transition-colors'} />
                            <span className="font-bold tracking-tight">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <Link
                href="/add-expense"
                className="mt-4 bg-primary text-white p-4 rounded-2xl flex items-center justify-center gap-2 font-bold hover:bg-primary/90 transition-all card-shadow"
            >
                <PlusCircle size={20} /> Add Expense
            </Link>
        </aside>
    );
}

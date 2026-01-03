"use client";

import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, MoreHorizontal, Users as UsersIcon, BarChart3, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            setLoading(true);
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (authUser) {
                // Fetch Profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single();

                // Get name from profile, then metadata, then email
                const firstName = profile?.first_name || authUser.user_metadata?.first_name || authUser.email?.split('@')[0];
                setUser({ ...authUser, ...profile, first_name: firstName });

                // Fetch Groups
                const { data: groupsData } = await supabase
                    .from('groups')
                    .select(`
                        *,
                        members:group_members(count)
                    `)
                    .limit(3)
                    .order('created_at', { ascending: false });

                if (groupsData) setGroups(groupsData);
            }
            setLoading(false);
        }
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="px-2 py-4 md:px-10 md:py-10 space-y-10 text-foreground">
            {/* Header */}
            <div className="flex justify-between items-center px-1 md:px-0">
                <div>
                    <h1 className="text-3xl font-bold font-poppins">Dashboard</h1>
                    <p className="text-foreground/50">Welcome back, {user?.first_name}! 👋</p>
                </div>
                <Link href="/profile" className="w-12 h-12 rounded-2xl bg-slate-200 overflow-hidden card-shadow hover:scale-105 transition-transform flex items-center justify-center border-2 border-white dark:border-slate-800">
                    <img src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.first_name || 'User'}`} alt="profile" />
                </Link>
            </div>

            {/* Balance Card */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-primary p-6 md:p-8 rounded-[2.5rem] text-white card-shadow relative overflow-hidden group">
                    <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                    <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                        <div className="flex justify-between items-start">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                                <Wallet size={24} />
                            </div>
                            <span className="bg-white/20 px-4 py-1 rounded-full text-xs font-medium backdrop-blur-md">Total Balance</span>
                        </div>
                        <div>
                            <p className="text-white/70 text-sm mb-1 uppercase tracking-wider font-semibold">Net Balance</p>
                            <h2 className="text-5xl font-bold font-poppins">₹0</h2>
                        </div>
                        <div className="flex gap-4">
                            <Link href="/add-expense" className="flex-grow bg-white text-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                                <Plus size={20} /> Add Expense
                            </Link>
                            <Link href="/settle" className="flex-grow bg-white/20 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 backdrop-blur-md hover:bg-white/30 transition-colors">
                                Settle Up
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] card-shadow border border-slate-50 dark:border-slate-700 flex flex-col justify-between opacity-50">
                        <div className="w-12 h-12 bg-success/10 text-success rounded-2xl flex items-center justify-center">
                            <ArrowUpRight size={24} />
                        </div>
                        <div>
                            <p className="text-foreground/40 text-[10px] font-bold uppercase tracking-wider mb-1 text-success/60">Coming In</p>
                            <p className="text-2xl font-bold text-success font-poppins">₹0</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] card-shadow border border-slate-50 dark:border-slate-700 flex flex-col justify-between opacity-50">
                        <div className="w-12 h-12 bg-danger/10 text-danger rounded-2xl flex items-center justify-center">
                            <ArrowDownLeft size={24} />
                        </div>
                        <div>
                            <p className="text-foreground/40 text-[10px] font-bold uppercase tracking-wider mb-1 text-danger/60">Going Out</p>
                            <p className="text-2xl font-bold text-danger font-poppins">₹0</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Groups Section */}
            <div className="space-y-6">
                <div className="flex justify-between items-center px-1 md:px-0">
                    <h2 className="text-2xl font-bold font-poppins">Your Groups</h2>
                    <Link href="/groups" className="text-primary font-semibold text-sm hover:underline">View All</Link>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {groups.length === 0 ? (
                        <div className="col-span-full py-12 bg-white/50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-4">
                            <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">No entries found</p>
                            <Link href="/groups/new" className="text-primary font-bold hover:underline">Create a group now</Link>
                        </div>
                    ) : (
                        groups.map((group) => (
                            <Link key={group.id} href={`/group/${group.id}`} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] card-shadow border border-slate-50 dark:border-slate-700 hover:scale-[1.02] transition-transform block">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                        <UsersIcon size={24} />
                                    </div>
                                    <button className="text-foreground/20 hover:text-foreground/40 transition-colors">
                                        <MoreHorizontal />
                                    </button>
                                </div>
                                <h3 className="text-lg font-bold mb-1 font-poppins">{group.name}</h3>
                                <p className="text-foreground/40 text-xs mb-4">{group.members?.[0]?.count || 1} members</p>

                                <div className="pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                                    <p className="text-xs font-bold text-foreground/40">
                                        Active recently
                                    </p>
                                    <div className="flex -space-x-2">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 flex items-center justify-center text-[8px] font-bold text-foreground/20 italic">
                                                ?
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}

                    <Link href="/groups/new" className="border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-foreground/40 hover:text-primary hover:border-primary/40 transition-all hover:bg-primary/5">
                        <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center transition-transform hover:scale-110">
                            <Plus size={24} />
                        </div>
                        <span className="font-bold">Create Group</span>
                    </Link>
                </div>
            </div>

            {/* Quick Insights (Placeholder) */}
            <div className="bg-gradient-to-r from-secondary to-primary p-8 rounded-[2.5rem] text-white card-shadow flex items-center justify-between overflow-hidden relative">
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="relative z-10 space-y-2">
                    <p className="text-white/70 text-sm font-medium">Smart AI Insight ✨</p>
                    <h3 className="text-xl font-bold font-poppins transition-all group-hover:translate-x-1">Ready to start splitting?</h3>
                    <p className="text-white/80 text-sm">Add an expense to see your spending patterns here.</p>
                </div>
                <div className="hidden md:block relative z-10">
                    <BarChart3 size={64} className="text-white/20" />
                </div>
            </div>
            <div className="h-20 md:hidden" /> {/* Navigation Spacer */}
        </div>
    );
}

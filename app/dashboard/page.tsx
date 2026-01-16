"use client";

import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, MoreHorizontal, Users as UsersIcon, BarChart3, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { NotificationBell } from "@/components/common/notification-bell";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ incoming: 0, outgoing: 0, net: 0 });

    const fetchDashboardData = async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser) {
            // Fetch Profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            const firstName = profile?.first_name || authUser.user_metadata?.first_name || authUser.email?.split('@')[0];
            setUser({ ...authUser, ...profile, first_name: firstName });

            // Fetch Groups
            const { data: groupsData } = await supabase
                .from('groups')
                .select(`
                    *,
                    members:group_members(count)
                `)
                .order('created_at', { ascending: false });

            if (groupsData) setGroups(groupsData);

            // Fetch all expenses for user's groups to calculate balance
            const { data: expenses } = await supabase
                .from('expenses')
                .select('id, amount, paid_by, group_id');

            const { data: splits } = await supabase
                .from('expense_splits')
                .select('expense_id, user_id, amount');

            if (expenses && splits) {
                let incoming = 0; // Money others owe me
                let outgoing = 0; // Money I owe others

                expenses.forEach(exp => {
                    const expSplits = splits.filter(s => s.expense_id === exp.id);

                    if (exp.paid_by === authUser.id) {
                        // I paid, others owe their shares
                        expSplits.forEach(s => {
                            if (s.user_id !== authUser.id) {
                                incoming += Number(s.amount);
                            }
                        });
                    } else {
                        // Someone else paid, I might owe a share
                        const mySplit = expSplits.find(s => s.user_id === authUser.id);
                        if (mySplit) {
                            outgoing += Number(mySplit.amount);
                        }
                    }
                });

                setStats({
                    incoming,
                    outgoing,
                    net: incoming - outgoing
                });
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        setLoading(true); // Set loading true when effect runs
        fetchDashboardData();

        // Subscribe to changes
        const channel = supabase
            .channel('dashboard_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => fetchDashboardData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'expense_splits' }, () => fetchDashboardData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, () => fetchDashboardData())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
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
                <div className="flex items-center gap-6">
                    <Link href="/profile" className="w-12 h-12 rounded-2xl bg-slate-200 overflow-hidden card-shadow hover:scale-105 transition-transform flex items-center justify-center border-2 border-white dark:border-slate-800">
                        <img src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.first_name || 'User'}`} alt="profile" />
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold font-poppins text-slate-900 dark:text-white leading-none">Dashboard</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-foreground/40 text-xs md:text-sm font-medium">Hello, {user?.first_name} 👋</p>
                            <button onClick={() => fetchDashboardData()} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors opacity-40">
                                <History size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <NotificationBell />
                    <button className="hidden sm:flex p-3 bg-white dark:bg-slate-800 rounded-2xl card-shadow border border-slate-50 dark:border-slate-700 hover:scale-105 transition-transform text-foreground/40">
                        <BarChart3 size={24} />
                    </button>
                </div>
            </div>

            {/* Balance Card */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-primary p-7 md:p-8 rounded-[2.5rem] md:rounded-[3rem] text-white card-shadow relative overflow-hidden group shadow-2xl shadow-primary/30">
                    <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                    <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                        <div className="flex justify-between items-start">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                                <Wallet size={24} />
                            </div>
                            <span className="bg-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">Total Balance</span>
                        </div>
                        <div>
                            <p className="text-white/70 text-[10px] mb-1 uppercase tracking-[0.2em] font-black">Net Balance</p>
                            <h2 className="text-5xl md:text-6xl font-bold font-poppins">₹{stats.net.toLocaleString()}</h2>
                        </div>
                        <div className="flex gap-4">
                            <Link href="/add-expense" className="flex-grow bg-white text-primary py-4.5 rounded-[1.5rem] font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-lg">
                                <Plus size={20} /> Add Expense
                            </Link>
                            <Link href="/settle" className="flex-grow bg-white/20 text-white py-4.5 rounded-[1.5rem] font-bold flex items-center justify-center gap-2 backdrop-blur-md hover:bg-white/30 transition-all active:scale-95">
                                Settle Up
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2.5rem] card-shadow border border-slate-50 dark:border-slate-800 flex flex-col justify-between opacity-50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ArrowUpRight size={64} />
                        </div>
                        <div className="w-12 h-12 bg-success/10 text-success rounded-2xl flex items-center justify-center">
                            <ArrowUpRight size={24} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest">Coming In</p>
                            <p className="text-2xl md:text-3xl font-bold text-success font-poppins">₹{stats.incoming.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2.5rem] card-shadow border border-slate-50 dark:border-slate-800 flex flex-col justify-between opacity-50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ArrowDownLeft size={64} />
                        </div>
                        <div className="w-12 h-12 bg-danger/10 text-danger rounded-2xl flex items-center justify-center">
                            <ArrowDownLeft size={24} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest">Going Out</p>
                            <p className="text-2xl md:text-3xl font-bold text-danger font-poppins">₹{stats.outgoing.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Groups Section */}
            <div className="space-y-6">
                <div className="flex justify-between items-end px-2 md:px-0">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold font-poppins text-slate-900 dark:text-white">Active Groups</h2>
                        <p className="text-foreground/40 text-xs font-medium">Your most recent groups</p>
                    </div>
                    <Link href="/groups" className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline py-2">View All</Link>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {groups.length === 0 ? (
                        <div className="col-span-full py-20 bg-white/40 dark:bg-slate-800/40 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary">
                                <UsersIcon size={40} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">No entries found</p>
                                <Link href="/groups/new" className="text-primary font-bold hover:underline block pt-2">Create a group now</Link>
                            </div>
                        </div>
                    ) : (
                        groups.map((group) => (
                            <Link key={group.id} href={`/group/${group.id}`} className="bg-white dark:bg-slate-800 p-7 rounded-[2.5rem] card-shadow border border-slate-50 dark:border-slate-800 hover:scale-[1.02] transition-all block group hover:border-primary/20">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                        <UsersIcon size={28} />
                                    </div>
                                    <button className="text-foreground/10 hover:text-foreground/30 transition-colors">
                                        <MoreHorizontal />
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold mb-1 font-poppins text-slate-900 dark:text-white truncate">{group.name}</h3>
                                <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest mb-6">
                                    {group.members?.[0]?.count || 1} members attached
                                </p>

                                <div className="pt-5 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center group-hover:border-primary/10 transition-colors">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20">
                                        Activity Detected
                                    </p>
                                    <div className="flex -space-x-2.5">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-[10px] font-bold text-foreground/10 italic">
                                                ?
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}

                    <Link href="/groups/new" className="border-2 border-dashed border-slate-200 dark:border-slate-700/50 p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-foreground/20 hover:text-primary hover:border-primary/40 transition-all hover:bg-primary/5 min-h-[220px]">
                        <div className="w-16 h-16 rounded-[1.5rem] border-2 border-current flex items-center justify-center transition-transform hover:scale-110">
                            <Plus size={32} />
                        </div>
                        <span className="font-black text-[10px] uppercase tracking-widest">Register Group</span>
                    </Link>
                </div>
            </div>

            {/* Quick Insights (Placeholder) */}
            <div className="bg-gradient-to-r from-secondary to-primary p-10 rounded-[3rem] text-white card-shadow flex items-center justify-between overflow-hidden relative shadow-2xl shadow-primary/20">
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50" />
                <div className="relative z-10 space-y-3">
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Smart Insight Engine ✨</p>
                    <h3 className="text-2xl font-bold font-poppins">Ready to settle up?</h3>
                    <p className="text-white/80 text-sm max-w-md">Your spending habits will appear here once you record your first group expense.</p>
                </div>
                <div className="hidden lg:block relative z-10 opacity-20">
                    <BarChart3 size={100} />
                </div>
            </div>
            <div className="h-20 md:hidden" />
        </div>
    );
}

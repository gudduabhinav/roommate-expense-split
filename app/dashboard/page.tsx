"use client";

import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, MoreHorizontal, Users as UsersIcon, BarChart3, Loader2, RotateCw, Trash2, Edit2, Receipt } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { NotificationBell } from "@/components/common/notification-bell";
import { PushPermissionPrompt } from "@/components/common/push-permission-prompt";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ incoming: 0, outgoing: 0, net: 0, totalSpent: 0 });
    const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; expenseId: string | null }>({ isOpen: false, expenseId: null });

    const fetchDashboardData = async () => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) {
                setLoading(false);
                return;
            }

            // Parallel fetching for speed and independence
            const [profileRes, groupsRes, expensesRes, splitsRes, membersRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', authUser.id).single(),
                supabase.from('groups').select('*').order('created_at', { ascending: false }),
                supabase.from('expenses').select('*'),
                supabase.from('expense_splits').select('*'),
                supabase.from('group_members').select('group_id')
            ]);

            // 1. Handle User Profile
            const profile = profileRes.data;
            const firstName = profile?.first_name || authUser.user_metadata?.first_name || authUser.email?.split('@')[0];
            setUser({ ...authUser, ...profile, first_name: firstName });

            // 2. Handle Expenses & Stats (Crucial Fix: Use empty arrays as fallback)
            const expenses = expensesRes.data || [];
            const splits = splitsRes.data || [];
            const groupsData = groupsRes.data || [];
            const memberData = membersRes.data || [];

            console.log(`Fetched: ${expenses.length} expenses, ${splits.length} splits, ${groupsData.length} groups`);

            let incoming = 0;
            let outgoing = 0;
            let totalSpent = 0;

            expenses.forEach(exp => {
                if (exp.paid_by === authUser.id) {
                    totalSpent += Number(exp.amount);
                }

                const expSplits = splits.filter(s => s.expense_id === exp.id);

                if (exp.paid_by === authUser.id) {
                    expSplits.forEach(s => {
                        if (s.user_id !== authUser.id) {
                            incoming += Number(s.amount);
                        }
                    });
                } else {
                    const mySplit = expSplits.find(s => s.user_id === authUser.id);
                    if (mySplit) {
                        outgoing += Number(mySplit.amount);
                    }
                }
            });

            // 3. Update Groups with Totals & Members (for avatars)
            const { data: memberProfiles } = await supabase
                .from('group_members')
                .select('group_id, user_id, profiles:user_id(avatar_url, first_name)');

            const groupIds = memberData?.map(g => g.group_id) || [];

            const groupsWithTotals = groupsData.map(g => {
                const groupExpenses = expenses.filter(e => e.group_id === g.id);
                const groupTotal = groupExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
                const groupMembers = memberProfiles?.filter(m => m.group_id === g.id) || [];
                return {
                    ...g,
                    total_expenses: groupTotal,
                    expense_count: groupExpenses.length,
                    member_count: groupMembers.length,
                    members: groupMembers.map(m => m.profiles)
                };
            });

            setGroups(groupsWithTotals);
            setStats({
                incoming,
                outgoing,
                net: incoming - outgoing,
                totalSpent
            });

            // 4. Get Recent Expenses (last 5)
            const { data: recentExp } = await supabase
                .from('expenses')
                .select('*, profiles:paid_by(full_name, avatar_url, first_name), groups(name)')
                .in('group_id', groupIds)
                .order('created_at', { ascending: false })
                .limit(5);

            console.log('Recent Expenses:', recentExp);
            console.log('Current User ID:', authUser.id);
            if (recentExp && recentExp.length > 0) {
                console.log('First expense paid_by:', recentExp[0].paid_by, 'Type:', typeof recentExp[0].paid_by);
            }
            setRecentExpenses(recentExp || []);

        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchDashboardData();

        // Auto-retry if data is unexpectedly empty (helps with mobile sync)
        const retryTimer = setTimeout(() => {
            if (stats.totalSpent === 0 && groups.length > 0) {
                console.log("Retrying dashboard fetch for mobile sync...");
                fetchDashboardData();
            }
        }, 2500);

        // Subscribe to changes
        const channel = supabase
            .channel('dashboard_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => fetchDashboardData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'expense_splits' }, () => fetchDashboardData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, () => fetchDashboardData())
            .subscribe();

        return () => {
            clearTimeout(retryTimer);
            supabase.removeChannel(channel);
        };
    }, []);

    const handleDeleteExpense = async (expenseId: string) => {
        setDeleteConfirm({ isOpen: true, expenseId });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.expenseId) return;

        try {
            const { error } = await supabase.from('expenses').delete().eq('id', deleteConfirm.expenseId);
            if (error) throw error;
            setDeleteConfirm({ isOpen: false, expenseId: null });
            fetchDashboardData();
        } catch (error: any) {
            alert("Delete failed: " + error.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="px-1 md:px-8 py-4 md:py-8 space-y-6 md:space-y-10 pb-32 md:pb-10 text-foreground">
            <PushPermissionPrompt />
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="Delete Expense?"
                message="This will permanently delete this expense and update all balances. This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, expenseId: null })}
            />
            {/* Top Bar */}
            <div className="flex justify-between items-center px-2 md:px-0">
                <div className="flex items-center gap-6">
                    <Link href="/profile" className="w-12 h-12 rounded-2xl bg-slate-200 overflow-hidden card-shadow hover:scale-105 transition-transform flex items-center justify-center border-2 border-white dark:border-slate-800">
                        <img src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.first_name || 'User'}`} alt="profile" />
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold font-poppins text-slate-900 dark:text-white leading-none">Dashboard</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-foreground/40 text-xs md:text-sm font-medium truncate max-w-[150px] md:max-w-none">Hello, {user?.first_name} 👋</p>
                            <button onClick={async () => {
                                if (confirm("Repair app sync? This will clear cache and reload.")) {
                                    localStorage.clear();
                                    const registrations = await navigator.serviceWorker.getRegistrations();
                                    for (let registration of registrations) {
                                        await registration.unregister();
                                    }
                                    window.location.reload();
                                }
                            }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors opacity-20" title="Repair Sync">
                                <Trash2 size={12} />
                            </button>
                            <button onClick={() => fetchDashboardData()} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors opacity-40">
                                <RotateCw size={14} />
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
            <div className="grid md:grid-cols-2 gap-6 overflow-hidden md:overflow-visible">
                <div className="bg-primary p-6 md:p-8 rounded-3xl md:rounded-[3rem] text-white card-shadow relative overflow-hidden group shadow-2xl shadow-primary/30 mx-1 md:mx-0">
                    <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                    <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                        <div className="flex justify-between items-start">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                                <Wallet size={24} />
                            </div>
                            <span className="bg-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">Total Balance</span>
                        </div>
                        <div>
                            <p className="text-white/70 text-[10px] mb-1 uppercase tracking-[0.2em] font-black">Gross Spending</p>
                            <h2 className="text-4xl md:text-6xl font-bold font-poppins text-white">₹{stats.totalSpent.toLocaleString()}</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <Link href="/add-expense" className="bg-white text-primary py-3 md:py-4.5 rounded-2xl md:rounded-[1.5rem] font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-lg text-xs md:text-base">
                                <Plus size={18} /> Add
                            </Link>
                            <Link href="/settle" className="bg-white/20 text-white py-3 md:py-4.5 rounded-2xl md:rounded-[1.5rem] font-bold flex items-center justify-center gap-2 backdrop-blur-md hover:bg-white/30 transition-all active:scale-95 text-xs md:text-base">
                                Settle Up
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-800 p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] card-shadow border border-slate-50 dark:border-slate-800 flex flex-col justify-between opacity-50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ArrowUpRight size={64} />
                        </div>
                        <div className="w-12 h-12 bg-success/10 text-success rounded-2xl flex items-center justify-center">
                            <ArrowUpRight size={24} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest">Incoming (Owed to you)</p>
                            <p className="text-2xl md:text-3xl font-bold text-success font-poppins">₹{stats.incoming.toLocaleString()}</p>
                            {stats.incoming === 0 && groups.length > 0 && groups.some(g => g.member_count === 1) && (
                                <p className="text-[8px] text-foreground/20 font-bold uppercase italic">Add friends to see splits</p>
                            )}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] card-shadow border border-slate-100 dark:border-slate-800 flex flex-col justify-between opacity-50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ArrowDownLeft size={64} />
                        </div>
                        <div className="w-12 h-12 bg-danger/10 text-danger rounded-2xl flex items-center justify-center">
                            <ArrowDownLeft size={24} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest">Outgoing (You owe)</p>
                            <p className="text-2xl md:text-3xl font-bold text-danger font-poppins">₹{stats.outgoing.toLocaleString()}</p>
                            {stats.outgoing === 0 && groups.length > 0 && (
                                <p className="text-[8px] text-foreground/20 font-bold uppercase italic">No debts found ✨</p>
                            )}
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
                            <Link
                                key={group.id}
                                href={`/group/${group.id}`}
                                className="bg-white dark:bg-slate-800 p-5 md:p-7 rounded-3xl md:rounded-[2.5rem] card-shadow border border-slate-50 dark:border-slate-800 hover:scale-[1.02] transition-all group hover:border-primary/20"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                        <UsersIcon size={28} />
                                    </div>
                                    <button className="text-foreground/10 hover:text-foreground/30 transition-colors">
                                        <MoreHorizontal />
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold mb-1 font-poppins text-slate-900 dark:text-white truncate">{group.name}</h3>
                                <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest mb-4">
                                    {group.expense_count || 0} Records Found • {group.member_count || 0} Members
                                </p>
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 mb-6">
                                    <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider mb-1">Group Total</p>
                                    <p className="text-lg font-bold text-primary font-poppins">₹{(group.total_expenses || 0).toLocaleString()}</p>
                                </div>

                                <div className="pt-5 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center group-hover:border-primary/10 transition-colors">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20">
                                        {group.total_expenses > 0 ? 'Active History' : 'New Group'}
                                    </p>
                                    <div className="flex -space-x-2.5">
                                        {(group.members || []).slice(0, 3).map((m: any, i: number) => (
                                            <div key={i} className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-900 overflow-hidden shadow-sm">
                                                <img
                                                    src={m?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m?.first_name || 'User'}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                        {group.member_count > 3 && (
                                            <div className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-800 bg-slate-800 text-white flex items-center justify-center text-[8px] font-bold">
                                                +{group.member_count - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}

                    <Link href="/groups/new" className="bg-white/40 dark:bg-slate-800/20 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl md:rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-foreground/20 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all p-8 min-h-[220px]">
                        <div className="w-16 h-16 rounded-[1.5rem] border-2 border-current flex items-center justify-center transition-transform hover:scale-110">
                            <Plus size={32} />
                        </div>
                        <span className="font-black text-[10px] uppercase tracking-widest">Register Group</span>
                    </Link>
                </div>
            </div>

            {/* Recent Expenses Section */}
            {recentExpenses.length > 0 && (
                <div className="space-y-6">
                    <div className="flex justify-between items-end px-2 md:px-0">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold font-poppins text-slate-900 dark:text-white">Recent Expenses</h2>
                            <p className="text-foreground/40 text-xs font-medium">Your latest transactions</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {recentExpenses.map((expense) => {
                            const isPaidByUser = expense.paid_by === user?.id;
                            return (
                            <div key={expense.id} className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-3xl card-shadow border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-primary/40 transition-all mx-1 md:mx-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                                        <Receipt size={24} className="text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white">{expense.description}</h3>
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={expense.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${expense.profiles?.first_name || 'User'}`}
                                                className="w-4 h-4 rounded-full"
                                            />
                                            <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest">
                                                {expense.profiles?.full_name || 'Unknown'} • {expense.groups?.name || 'Group'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-lg md:text-xl font-bold font-poppins text-primary">₹{(expense.amount || 0).toLocaleString()}</p>
                                        <p className="text-[10px] text-foreground/40 font-black uppercase">{new Date(expense.created_at).toLocaleDateString()}</p>
                                    </div>
                                    {isPaidByUser && (
                                        <div className="flex gap-1 border-l border-slate-100 dark:border-slate-700 pl-3">
                                            <Link
                                                href={`/edit-expense/${expense.id}`}
                                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteExpense(expense.id)}
                                                className="p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )})}
                    </div>
                </div>
            )}

            {/* Quick Insights (Placeholder) */}
            <div className="bg-gradient-to-r from-secondary to-primary p-10 rounded-[3rem] text-white card-shadow flex items-center justify-between overflow-hidden relative shadow-2xl shadow-primary/20">
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50" />
                <div className="relative z-10 space-y-3">
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Smart Insight Engine ✨</p>
                    <h3 className="text-2xl font-bold font-poppins">
                        {stats.totalSpent > 0 ? "Great tracking so far!" : "Ready to settle up?"}
                    </h3>
                    <p className="text-white/80 text-sm max-w-md">
                        {stats.totalSpent > 0
                            ? `You've recorded ₹${stats.totalSpent.toLocaleString()} in shared expenses across ${groups.length} groups.`
                            : "Your spending habits will appear here once you record your first group expense."
                        }
                    </p>
                </div>
                <div className="hidden lg:block relative z-10 opacity-20">
                    <BarChart3 size={100} />
                </div>
            </div>
            <div className="h-20 md:hidden" />
        </div>
    );
}

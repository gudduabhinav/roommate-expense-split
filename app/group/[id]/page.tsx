"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, MoreVertical, Plus, Receipt, TrendingUp, History, Users as UsersIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function GroupDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("expenses");
    const [group, setGroup] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchGroupData() {
            setLoading(true);

            // Fetch Group Info
            const { data: groupData } = await supabase
                .from('groups')
                .select('*')
                .eq('id', id)
                .single();

            if (groupData) {
                setGroup(groupData);

                // Fetch Members
                const { data: membersData } = await supabase
                    .from('group_members')
                    .select(`
                        *,
                        profiles:user_id(*)
                    `)
                    .eq('group_id', id);

                if (membersData) setMembers(membersData);

                // Fetch Expenses
                const { data: expensesData } = await supabase
                    .from('expenses')
                    .select('*')
                    .eq('group_id', id)
                    .order('created_at', { ascending: false });

                if (expensesData) setExpenses(expensesData);
            }
            setLoading(false);
        }
        fetchGroupData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-6">
                <h1 className="text-2xl font-bold font-poppins text-foreground">Group not found</h1>
                <p className="text-foreground/40">The group you're looking for doesn't exist or you don't have access.</p>
                <Link href="/dashboard" className="text-primary font-bold hover:underline">Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 md:pb-10 text-foreground">
            {/* Group Header */}
            <div className="bg-gradient-to-br from-primary to-secondary p-8 md:p-12 pb-24 text-white relative h-64 overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="max-w-5xl mx-auto flex justify-between items-start relative z-10">
                    <Link href="/dashboard" className="bg-white/20 p-2 rounded-xl backdrop-blur-md hover:bg-white/30 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <button className="bg-white/20 p-2 rounded-xl backdrop-blur-md hover:bg-white/30 transition-colors">
                        <MoreVertical size={20} />
                    </button>
                </div>

                <div className="max-w-5xl mx-auto mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold font-poppins">{group.name}</h1>
                        <p className="text-white/70 flex items-center gap-2 font-medium">
                            <UsersIcon size={16} /> {members.length} Members • Active recently
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-[2rem] p-6 border border-white/20 card-shadow">
                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Total Group Expense</p>
                        <p className="text-3xl font-bold font-poppins">₹{(group.total || 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 -mt-12 space-y-8 relative z-10">
                {/* Members Scroll */}
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {members.map((member) => (
                        <div key={member.id} className="flex-shrink-0 bg-white dark:bg-slate-800 p-6 rounded-[2rem] card-shadow border border-slate-100 dark:border-slate-700 w-48 space-y-4 hover:border-primary/20 transition-all">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden ring-2 ring-slate-50 dark:ring-slate-700">
                                    <img src={member.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.profiles?.full_name}`} alt="avatar" />
                                </div>
                                <div className={`text-[10px] font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-foreground/40 uppercase tracking-widest`}>
                                    Settled
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm truncate">{member.profiles?.full_name || 'Member'}</h3>
                                <p className={`font-bold font-poppins text-lg text-foreground/20`}>
                                    ₹0
                                </p>
                            </div>
                        </div>
                    ))}
                    <button className="flex-shrink-0 w-48 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-foreground/30 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all group">
                        <div className="p-2 rounded-full border-2 border-current group-hover:scale-110 transition-transform">
                            <Plus size={24} />
                        </div>
                        <span className="font-bold text-xs uppercase tracking-widest">Invite Friend</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-slate-800 p-2 rounded-[2rem] card-shadow border border-slate-100 dark:border-slate-700 flex backdrop-blur-lg">
                    {[
                        { id: "expenses", label: "Expenses", icon: Receipt },
                        { id: "balances", label: "Balances", icon: UsersIcon },
                        { id: "analytics", label: "Analytics", icon: TrendingUp },
                        { id: "activity", label: "Log", icon: History },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-grow flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all ${activeTab === tab.id ? 'bg-primary text-white card-shadow scale-[1.02]' : 'text-foreground/40 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                            >
                                <Icon size={18} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="space-y-4">
                    {activeTab === "expenses" && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-4">
                                <h2 className="text-xl font-bold font-poppins">Recent Expenses</h2>
                                <p className="text-xs font-bold text-foreground/40 uppercase tracking-widest">{expenses.length} Total</p>
                            </div>

                            {expenses.length === 0 ? (
                                <div className="py-20 bg-white/50 dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-foreground/20">
                                        <Receipt size={32} />
                                    </div>
                                    <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">No expenses yet</p>
                                    <Link href="/add-expense" className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-transform card-shadow flex items-center gap-2">
                                        <Plus size={20} /> Add One
                                    </Link>
                                </div>
                            ) : (
                                expenses.map((expense) => (
                                    <div key={expense.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] card-shadow border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-primary/20 transition-all cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                {expense.category || '📦'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold font-poppins">{expense.title}</h3>
                                                <p className="text-foreground/40 text-xs">Paid by <span className="text-primary font-semibold">Someone</span> • {new Date(expense.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold font-poppins text-primary">₹{(expense.amount || 0).toLocaleString()}</p>
                                            <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Share split</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "balances" && (
                        <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] card-shadow border border-slate-100 dark:border-slate-700 space-y-8 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center">
                                <UsersIcon size={40} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold font-poppins">All Settled Up!</h2>
                                <p className="text-foreground/40 max-w-xs mx-auto">None of the members owe anything at the moment. Keep it up!</p>
                            </div>
                            <button className="bg-slate-50 dark:bg-slate-900 px-8 py-4 rounded-2xl font-bold text-foreground/40 hover:text-primary transition-all">
                                View Settlement History
                            </button>
                        </div>
                    )}

                    {(activeTab === "analytics" || activeTab === "activity") && (
                        <div className="py-20 text-center space-y-4">
                            <p className="text-foreground/20 font-bold uppercase tracking-[0.2em] text-xs">Modules under construction</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

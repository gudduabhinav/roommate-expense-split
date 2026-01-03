"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, MoreVertical, Plus, Receipt, TrendingUp, History, Users as UsersIcon, Loader2, Share2, Copy, CheckCircle2 } from "lucide-react";
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
    const [copied, setCopied] = useState(false);

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

    const copyInviteLink = () => {
        if (!group?.invite_code) return;
        const link = `${window.location.origin}/join/${group.invite_code}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
            <div className="bg-gradient-to-br from-primary to-secondary p-8 md:p-12 pb-24 text-white relative h-72 overflow-hidden shadow-2xl">
                <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
                <div className="max-w-5xl mx-auto flex justify-between items-start relative z-10">
                    <Link href="/dashboard" className="bg-white/20 p-2 rounded-xl backdrop-blur-md hover:bg-white/30 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex gap-2">
                        <button
                            onClick={copyInviteLink}
                            className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md hover:bg-white/30 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
                        >
                            {copied ? <CheckCircle2 size={16} className="text-success-400" /> : <Share2 size={16} />}
                            {copied ? "Copied!" : "Invite Link"}
                        </button>
                        <button className="bg-white/20 p-2 rounded-xl backdrop-blur-md hover:bg-white/30 transition-colors">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">
                                {group.category}
                            </span>
                            <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Code: {group.invite_code}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold font-poppins tracking-tight">{group.name}</h1>
                        <p className="text-white/70 flex items-center gap-2 font-medium">
                            <UsersIcon size={16} /> {members.length} Members • Active recently
                        </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-[2.5rem] p-8 border border-white/20 shadow-2xl">
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Circle Balance</p>
                        <p className="text-4xl font-bold font-poppins">₹{(group.total || 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 -mt-8 space-y-10 relative z-10">
                {/* Members Scroll */}
                <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                    {members.map((member) => (
                        <div key={member.id} className="flex-shrink-0 bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] card-shadow border border-slate-100 dark:border-slate-700 w-52 space-y-4 hover:border-primary/40 transition-all hover:-translate-y-1">
                            <div className="flex justify-between items-start">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden ring-4 ring-slate-50 dark:ring-slate-700 shadow-lg">
                                    <img src={member.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.profiles?.full_name || member.profiles?.id}`} alt="avatar" />
                                </div>
                                <div className={`text-[10px] font-black px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-foreground/30 uppercase tracking-[0.1em]`}>
                                    Settled
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm truncate font-poppins">{member.profiles?.full_name || 'Member'}</h3>
                                <p className={`font-black font-poppins text-xl text-foreground/10`}>
                                    ₹0
                                </p>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={copyInviteLink}
                        className="flex-shrink-0 w-52 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-foreground/30 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all group backdrop-blur-sm"
                    >
                        <div className="p-3 rounded-full border-2 border-current group-hover:scale-110 transition-all group-hover:rotate-12">
                            {copied ? <CheckCircle2 size={32} /> : <Plus size={32} />}
                        </div>
                        <div className="text-center">
                            <span className="font-black text-[10px] uppercase tracking-widest block">{copied ? "Link Copied!" : "Invite Friend"}</span>
                            <span className="text-[10px] opacity-60">Share circle access</span>
                        </div>
                    </button>
                </div>

                {/* Tabs */}
                <div className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-[2.5rem] card-shadow border border-slate-100 dark:border-slate-700 flex backdrop-blur-2xl">
                    {[
                        { id: "expenses", label: "Ledger", icon: Receipt },
                        { id: "balances", label: "Owes", icon: UsersIcon },
                        { id: "analytics", label: "Stats", icon: TrendingUp },
                        { id: "activity", label: "History", icon: History },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-grow flex items-center justify-center gap-2 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-[1.02]' : 'text-foreground/30 hover:bg-slate-50 dark:hover:bg-slate-900'}`}
                            >
                                <Icon size={18} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Ledger Content Area */}
                <div className="space-y-6 pb-20">
                    {activeTab === "expenses" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center px-6">
                                <h2 className="text-2xl font-bold font-poppins">Recent Spendings</h2>
                                <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">{expenses.length} Records</p>
                            </div>

                            {expenses.length === 0 ? (
                                <div className="py-24 bg-white/40 dark:bg-slate-800/40 rounded-[3.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-6 backdrop-blur-sm">
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-foreground/10 rotate-3">
                                        <Receipt size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-bold font-poppins text-lg text-foreground/60">Empty Ledger</h3>
                                        <p className="text-foreground/30 text-xs max-w-[200px] mx-auto">Start adding expenses to track everyone's spendings.</p>
                                    </div>
                                    <Link href="/add-expense" className="bg-primary text-white px-10 py-4 rounded-2xl font-bold hover:scale-105 transition-all card-shadow flex items-center gap-2 shadow-lg shadow-primary/20">
                                        <Plus size={20} /> New Record
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4 px-2">
                                    {expenses.map((expense) => (
                                        <div key={expense.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] card-shadow border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-primary/40 transition-all cursor-pointer">
                                            <div className="flex items-center gap-5">
                                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-all shadow-inner">
                                                    {expense.category || '💸'}
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-bold font-poppins text-lg">{expense.title}</h3>
                                                    <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest">
                                                        By <span className="text-primary">Someone</span> • {new Date(expense.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <p className="text-2xl font-bold font-poppins text-primary">₹{(expense.amount || 0).toLocaleString()}</p>
                                                <div className="px-2 py-0.5 bg-primary/5 rounded-md inline-block">
                                                    <p className="text-[9px] text-primary/60 font-black uppercase tracking-widest">Split Equal</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "balances" && (
                        <div className="bg-white dark:bg-slate-800 p-12 rounded-[3.5rem] card-shadow border border-slate-100 dark:border-slate-700 space-y-8 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-success/5 text-success rounded-[2rem] flex items-center justify-center rotate-6">
                                <UsersIcon size={48} />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-3xl font-bold font-poppins">Crystal Clear!</h2>
                                <p className="text-foreground/30 max-w-xs mx-auto text-sm">Everyone is square. No debts, no worries. Split something soon!</p>
                            </div>
                            <button className="bg-slate-50 dark:bg-slate-900 px-10 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest text-foreground/30 hover:text-primary transition-all border border-transparent hover:border-primary/10">
                                View Settlement Logs
                            </button>
                        </div>
                    )}

                    {(activeTab === "analytics" || activeTab === "activity") && (
                        <div className="py-24 text-center space-y-4">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto text-foreground/10">
                                <TrendingUp size={32} />
                            </div>
                            <p className="text-foreground/20 font-black uppercase tracking-[0.3em] text-[10px]">Processing Intelligence...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

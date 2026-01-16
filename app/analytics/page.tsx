"use client";

import { useState, useEffect } from "react";
import { Target, Zap, Sparkles, BarChart3, PieChart, Loader2, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

const CATEGORIES = [
    { id: "Dining", icon: "🍴", color: "bg-red-500" },
    { id: "Groceries", icon: "🛒", color: "bg-green-500" },
    { id: "Electricity", icon: "⚡", color: "bg-yellow-500" },
    { id: "Rent", icon: "🏠", color: "bg-blue-500" },
    { id: "Transport", icon: "🚕", color: "bg-purple-500" },
    { id: "Trip", icon: "✈️", color: "bg-cyan-500" },
    { id: "Medical", icon: "🏥", color: "bg-pink-500" },
    { id: "Entertainment", icon: "🍿", color: "bg-orange-500" },
    { id: "Other", icon: "📦", color: "bg-slate-500" },
];

export default function AnalyticsPage() {
    const [period, setPeriod] = useState("Monthly");
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [stats, setStats] = useState({ total: 0, count: 0, avgPerExpense: 0 });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: memberData } = await supabase
                .from('group_members')
                .select('group_id')
                .eq('user_id', user.id);

            const groupIds = memberData?.map(m => m.group_id) || [];
            console.log('Analytics - Group IDs:', groupIds);

            if (groupIds.length === 0) {
                setLoading(false);
                return;
            }

            const { data: expensesData } = await supabase
                .from('expenses')
                .select('*')
                .in('group_id', groupIds);

            console.log('Analytics - Expenses Data:', expensesData);

            const { data: groupsData } = await supabase
                .from('groups')
                .select('*')
                .in('id', groupIds);

            setExpenses(expensesData || []);
            setGroups(groupsData || []);

            const total = (expensesData || []).reduce((sum, e) => sum + Number(e.amount), 0);
            setStats({
                total,
                count: expensesData?.length || 0,
                avgPerExpense: expensesData?.length ? total / expensesData.length : 0
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (expenses.length === 0) {
        return (
            <div className="p-4 md:p-10 space-y-10 pb-24 text-foreground">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-poppins">Spending Insights</h1>
                        <p className="text-foreground/50">Smart analysis of your group dynamics</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-12 rounded-[3rem] card-shadow border border-slate-50 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center text-primary/20">
                        <BarChart3 size={64} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold font-poppins">No data to analyze yet</h2>
                        <p className="text-foreground/40 max-w-sm mx-auto">Once you start adding shared expenses, we'll generate beautiful charts and insights here.</p>
                    </div>
                    <Link href="/add-expense" className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/30">
                        Add First Expense
                    </Link>
                </div>
            </div>
        );
    }

    const total = stats.total;
    const categoryStats: Record<string, number> = {};
    expenses.forEach(exp => {
        const cat = exp.category || 'Other';
        categoryStats[cat] = (categoryStats[cat] || 0) + Number(exp.amount);
    });

    const categoryList = Object.entries(categoryStats)
        .map(([cat, amount]) => ({
            category: cat,
            amount,
            percentage: (amount / total) * 100,
            ...CATEGORIES.find(c => c.id === cat)
        }))
        .sort((a, b) => b.amount - a.amount);

    const monthlyData: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.toLocaleDateString('en-US', { month: 'short' });
        monthlyData[key] = 0;
    }

    expenses.forEach(exp => {
        const expDate = new Date(exp.date || exp.created_at);
        const monthKey = expDate.toLocaleDateString('en-US', { month: 'short' });
        if (monthlyData[monthKey] !== undefined) {
            monthlyData[monthKey] += Number(exp.amount);
        }
    });

    const monthlyList = Object.entries(monthlyData);
    const maxMonthly = Math.max(...monthlyList.map(([_, amt]) => amt), 1);

    return (
        <div className="p-4 md:p-10 space-y-10 pb-24 text-foreground">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-poppins">Spending Insights</h1>
                    <p className="text-foreground/50">Smart analysis across {groups.length} groups</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl card-shadow border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2">Total Spent</p>
                    <p className="text-3xl font-bold font-poppins text-primary">₹{total.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl card-shadow border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2">Expenses</p>
                    <p className="text-3xl font-bold font-poppins text-slate-900 dark:text-white">{stats.count}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl card-shadow border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2">Avg/Expense</p>
                    <p className="text-3xl font-bold font-poppins text-slate-900 dark:text-white">₹{stats.avgPerExpense.toFixed(0)}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl card-shadow border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2">Groups</p>
                    <p className="text-3xl font-bold font-poppins text-slate-900 dark:text-white">{groups.length}</p>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-700 space-y-4">
                <h3 className="text-lg font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
                    <PieChart size={20} className="text-primary" />
                    Category Breakdown
                </h3>
                <div className="space-y-3">
                    {categoryList.map((cat) => (
                        <div key={cat.category} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{cat.icon || '📦'}</span>
                                    <span className="font-bold text-sm text-slate-900 dark:text-white">{cat.category}</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-900 dark:text-white">₹{cat.amount.toLocaleString()}</p>
                                    <p className="text-[10px] text-foreground/40 font-black">{cat.percentage.toFixed(1)}%</p>
                                </div>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${cat.color || 'bg-primary'} transition-all duration-500`}
                                    style={{ width: `${cat.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-700 space-y-4">
                <h3 className="text-lg font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp size={20} className="text-primary" />
                    Monthly Trend (Last 6 Months)
                </h3>
                <div className="flex items-end justify-between gap-2 h-40">
                    {monthlyList.map(([month, amount]) => {
                        const height = maxMonthly > 0 ? (amount / maxMonthly) * 100 : 0;
                        return (
                            <div key={month} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex flex-col justify-end h-32">
                                    <div 
                                        className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all duration-500 relative group"
                                        style={{ height: `${height}%` }}
                                    >
                                        {amount > 0 && (
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                ₹{amount.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-[10px] font-black text-foreground/40 uppercase">{month}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
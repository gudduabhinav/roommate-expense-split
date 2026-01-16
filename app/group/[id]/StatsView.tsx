"use client";

import { TrendingUp, PieChart } from "lucide-react";

interface Expense {
    id: string;
    category: string;
    amount: number;
    paid_by: string;
    date?: string;
    created_at: string;
}

interface Member {
    user_id: string;
    profiles?: {
        full_name?: string;
        first_name?: string;
    };
}

interface StatsViewProps {
    expenses: Expense[];
    members: Member[];
}

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

export default function StatsView({ expenses, members }: StatsViewProps) {
    if (!expenses.length) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 text-center space-y-4">
                <PieChart size={48} className="mx-auto text-primary/20" />
                <p className="text-foreground/40 font-medium">No expenses yet. Add expenses to see stats.</p>
            </div>
        );
    }

    const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    // Category breakdown
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

    const maxAmount = Math.max(...categoryList.map(c => c.amount));

    // Member spending
    const memberStats: Record<string, number> = {};
    expenses.forEach(exp => {
        memberStats[exp.paid_by] = (memberStats[exp.paid_by] || 0) + Number(exp.amount);
    });

    const memberList = Object.entries(memberStats)
        .map(([userId, amount]) => {
            const member = members.find(m => m.user_id === userId);
            return {
                userId,
                name: member?.profiles?.full_name || member?.profiles?.first_name || 'Unknown',
                amount,
                percentage: (amount / total) * 100
            };
        })
        .sort((a, b) => b.amount - a.amount);

    // Monthly trend (last 6 months)
    const now = new Date();
    const monthlyData: Record<string, number> = {};
    
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
        <div className="space-y-6">
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

            {/* Member Spending */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-700 space-y-4">
                <h3 className="text-lg font-bold font-poppins text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp size={20} className="text-primary" />
                    Who Paid Most
                </h3>
                <div className="space-y-3">
                    {memberList.map((member, idx) => (
                        <div key={member.userId} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                #{idx + 1}
                            </div>
                            <div className="flex-grow">
                                <p className="font-bold text-sm text-slate-900 dark:text-white">{member.name}</p>
                                <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden mt-1">
                                    <div 
                                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                                        style={{ width: `${member.percentage}%` }}
                                    />
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-slate-900 dark:text-white">₹{member.amount.toLocaleString()}</p>
                                <p className="text-[10px] text-foreground/40 font-black">{member.percentage.toFixed(1)}%</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-700 space-y-4">
                <h3 className="text-lg font-bold font-poppins text-slate-900 dark:text-white">Monthly Trend</h3>
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

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-6 border border-primary/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2">Avg per Expense</p>
                    <p className="text-3xl font-bold font-poppins text-slate-900 dark:text-white">₹{(total / expenses.length).toFixed(0)}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-3xl p-6 border border-green-200 dark:border-green-800/30">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2">Total Expenses</p>
                    <p className="text-3xl font-bold font-poppins text-slate-900 dark:text-white">{expenses.length}</p>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownLeft, Users } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface Member {
    id: string;
    user_id: string;
    profiles?: {
        full_name?: string;
        avatar_url?: string;
        first_name?: string;
    };
}

interface Expense {
    id: string;
    paid_by: string;
    amount: number;
}

interface BalancesViewProps {
    groupId: string;
    members: Member[];
    expenses: Expense[];
    currentUserId?: string;
}

interface MemberBalance {
    userId: string;
    name: string;
    avatar: string;
    balance: number;
    paid: number;
    owes: number;
}

export default function BalancesView({ groupId, members, expenses, currentUserId }: BalancesViewProps) {
    const [balances, setBalances] = useState<MemberBalance[]>([]);
    const [settlements, setSettlements] = useState<{ from: string; to: string; amount: number; fromName: string; toName: string; fromAvatar: string; toAvatar: string }[]>([]);

    useEffect(() => {
        calculateBalances();
    }, [members, expenses, groupId]);

    const calculateBalances = async () => {
        if (!members.length || !expenses.length) {
            setBalances([]);
            setSettlements([]);
            return;
        }

        const expenseIds = expenses.map(e => e.id);
        const { data: splitsData } = await supabase
            .from('expense_splits')
            .select('*')
            .in('expense_id', expenseIds);

        if (!splitsData) return;

        const memberBalances: Record<string, { paid: number; owes: number }> = {};

        members.forEach(m => {
            memberBalances[m.user_id] = { paid: 0, owes: 0 };
        });

        expenses.forEach(exp => {
            const expSplits = splitsData.filter(s => s.expense_id === exp.id);
            
            if (memberBalances[exp.paid_by]) {
                memberBalances[exp.paid_by].paid += Number(exp.amount);
            }

            expSplits.forEach(split => {
                if (memberBalances[split.user_id]) {
                    memberBalances[split.user_id].owes += Number(split.amount);
                }
            });
        });

        const balancesList: MemberBalance[] = members.map(m => ({
            userId: m.user_id,
            name: m.profiles?.full_name || 'Member',
            avatar: m.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.profiles?.first_name || 'User'}`,
            paid: memberBalances[m.user_id]?.paid || 0,
            owes: memberBalances[m.user_id]?.owes || 0,
            balance: (memberBalances[m.user_id]?.paid || 0) - (memberBalances[m.user_id]?.owes || 0)
        })).sort((a, b) => b.balance - a.balance);

        setBalances(balancesList);

        // Calculate settlements
        const creditors = balancesList.filter(b => b.balance > 0).map(b => ({ ...b }));
        const debtors = balancesList.filter(b => b.balance < 0).map(b => ({ ...b }));
        const settlementsCalc: any[] = [];

        let i = 0, j = 0;
        while (i < creditors.length && j < debtors.length) {
            const credit = creditors[i].balance;
            const debt = Math.abs(debtors[j].balance);
            const amount = Math.min(credit, debt);

            if (amount > 0.01) {
                settlementsCalc.push({
                    from: debtors[j].userId,
                    to: creditors[i].userId,
                    amount,
                    fromName: debtors[j].name,
                    toName: creditors[i].name,
                    fromAvatar: debtors[j].avatar,
                    toAvatar: creditors[i].avatar
                });
            }

            creditors[i].balance -= amount;
            debtors[j].balance += amount;

            if (creditors[i].balance < 0.01) i++;
            if (Math.abs(debtors[j].balance) < 0.01) j++;
        }

        setSettlements(settlementsCalc);
    };

    if (!balances.length) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 text-center space-y-4">
                <Users size={48} className="mx-auto text-primary/20" />
                <p className="text-foreground/40 font-medium">No expenses yet. Add expenses to see balances.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Member Balances */}
            <div className="space-y-3">
                {balances.map((member) => (
                    <div key={member.userId} className={`bg-white dark:bg-slate-800 p-5 rounded-3xl border transition-all ${member.userId === currentUserId ? 'border-primary/40 ring-2 ring-primary/10' : 'border-slate-100 dark:border-slate-700'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img src={member.avatar} className="w-12 h-12 rounded-full ring-2 ring-slate-100 dark:ring-slate-700" />
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {member.name}
                                        {member.userId === currentUserId && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black uppercase">You</span>}
                                    </h3>
                                    <div className="flex gap-4 text-[10px] text-foreground/40 font-bold uppercase tracking-wider mt-1">
                                        <span>Paid ₹{member.paid.toLocaleString()}</span>
                                        <span>•</span>
                                        <span>Owes ₹{member.owes.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-2xl font-bold font-poppins ${member.balance > 0 ? 'text-green-500' : member.balance < 0 ? 'text-red-500' : 'text-foreground/20'}`}>
                                    {member.balance > 0 ? '+' : ''}₹{Math.abs(member.balance).toLocaleString()}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">
                                    {member.balance > 0 ? 'Gets Back' : member.balance < 0 ? 'To Pay' : 'Settled'}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Settlements */}
            {settlements.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold font-poppins px-4 text-slate-900 dark:text-white">Suggested Settlements</h3>
                    {settlements.map((settlement, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-5 rounded-3xl border border-orange-200 dark:border-orange-800/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={settlement.fromAvatar} className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-slate-800" />
                                    <ArrowUpRight className="text-orange-500" size={20} />
                                    <img src={settlement.toAvatar} className="w-10 h-10 rounded-full ring-2 ring-white dark:ring-slate-800" />
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-orange-600 dark:text-orange-400 font-poppins">₹{settlement.amount.toLocaleString()}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-500/60">
                                        {settlement.fromName.split(' ')[0]} → {settlement.toName.split(' ')[0]}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

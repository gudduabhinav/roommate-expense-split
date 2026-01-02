"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, User, ChevronRight, IndianRupee } from "lucide-react";
import Link from "next/link";

const PENDING_SETTLEMENTS = [
    { id: 1, from: "Rohan", to: "You", amount: 600, group: "Green Valley Apt" },
    { id: 2, from: "You", to: "Abhinav B.", amount: 860, group: "Goa Trip 2025" },
    { id: 3, from: "Priya", to: "You", amount: 450, group: "Green Valley Apt" },
];

export default function SettlePage() {
    const [settledIds, setSettledIds] = useState<number[]>([]);

    const handleSettle = (id: number) => {
        setSettledIds([...settledIds, id]);
    };

    return (
        <div className="p-4 md:p-10 space-y-10 pb-24 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-3xl font-bold font-poppins">Settle Up</h1>
            </div>

            <div className="bg-primary/5 border border-primary/10 p-6 rounded-[2rem] flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 text-primary rounded-2xl flex items-center justify-center">
                    <CheckCircle2 size={24} />
                </div>
                <div>
                    <p className="font-bold">Smart Settlement Engine</p>
                    <p className="text-sm text-foreground/60">We've calculated the minimum transactions needed to clear all debts.</p>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-xl font-bold font-poppins px-2">Pending Actions</h2>

                <div className="space-y-4">
                    {PENDING_SETTLEMENTS.filter(s => !settledIds.includes(s.id)).map((s) => (
                        <div key={s.id} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] card-shadow border border-slate-50 dark:border-slate-700 animate-in fade-in slide-in-from-bottom duration-500">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center -space-x-4">
                                        <div className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-800 bg-slate-100 overflow-hidden">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.from}`} alt="from" />
                                        </div>
                                        <div className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-800 bg-slate-100 overflow-hidden">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.to}`} alt="to" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold flex items-center gap-2">
                                            {s.from === "You" ? <span className="text-primary">You</span> : s.from}
                                            <ChevronRight size={14} className="text-foreground/20" />
                                            {s.to === "You" ? <span className="text-primary">You</span> : s.to}
                                        </p>
                                        <p className="text-xs text-foreground/40 font-bold uppercase tracking-widest">{s.group}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                                    <p className="text-3xl font-bold font-poppins text-foreground/80">₹{s.amount}</p>
                                    <button
                                        onClick={() => handleSettle(s.id)}
                                        className="w-full md:w-auto bg-slate-900 dark:bg-slate-700 text-white px-8 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all card-shadow"
                                    >
                                        Mark as Paid
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {PENDING_SETTLEMENTS.filter(s => !settledIds.includes(s.id)).length === 0 && (
                        <div className="text-center py-20 space-y-4">
                            <div className="text-6xl">🎉</div>
                            <h3 className="text-2xl font-bold font-poppins">All Settled Up!</h3>
                            <p className="text-foreground/40 max-w-xs mx-auto">No pending payments. You're a great roommate!</p>
                            <Link href="/dashboard" className="inline-block text-primary font-bold pt-4">Back to Dashboard</Link>
                        </div>
                    )}
                </div>
            </div>

            {settledIds.length > 0 && (
                <div className="space-y-6 pt-10">
                    <h2 className="text-xl font-bold font-poppins px-2 text-foreground/40">Recently Settled</h2>
                    {PENDING_SETTLEMENTS.filter(s => settledIds.includes(s.id)).map((s) => (
                        <div key={s.id} className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-between opacity-60">
                            <div className="flex items-center gap-4">
                                <CheckCircle2 className="text-success" size={20} />
                                <p className="text-sm font-bold">{s.from} paid {s.to} ₹{s.amount}</p>
                            </div>
                            <span className="text-[10px] font-bold text-foreground/40">JUST NOW</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

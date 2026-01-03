"use client";

import { useState } from "react";
import { Target, BrainCircuit, Sparkles, BarChart3 } from "lucide-react";

// Simple PieChart placeholder component
function PieChart({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 2a10 10 0 0 1 8.66 5" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 2a10 10 0 0 1 0 20" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

export default function AnalyticsPage() {
    const [period, setPeriod] = useState("Monthly");

    return (
        <div className="p-4 md:p-10 space-y-10 pb-24 text-foreground">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-poppins">Spending Insights</h1>
                    <p className="text-foreground/50">Smart analysis of your group dynamics</p>
                </div>
                <div className="flex bg-white dark:bg-slate-800 p-1 rounded-2xl card-shadow border border-slate-100 dark:border-slate-800">
                    {["Weekly", "Monthly", "Yearly"].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${period === p ? 'bg-primary text-white card-shadow' : 'text-foreground/40 hover:text-primary'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-12 rounded-[3rem] card-shadow border border-slate-50 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center text-primary/20">
                        <BarChart3 size={64} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold font-poppins">No data to analyze yet</h2>
                        <p className="text-foreground/40 max-w-sm mx-auto">Once you start adding shared expenses, we'll generate beautiful charts and insights here.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary to-indigo-700 p-8 rounded-[2.5rem] text-white card-shadow relative overflow-hidden group">
                        <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                    <BrainCircuit size={24} />
                                </div>
                                <span className="font-bold font-poppins">AI Insights</span>
                            </div>
                            <p className="text-white/80 leading-relaxed italic text-sm">
                                "Connect your accounts and add expenses to unlock our smart AI spending companion."
                            </p>
                            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Locked</span>
                                <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] card-shadow border border-slate-50 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl flex items-center justify-center">
                            <Sparkles size={24} />
                        </div>
                        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">Smart Alerts</p>
                        <p className="text-xs font-bold text-foreground/30 italic">Connect your data to see spending alerts</p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 opacity-40 grayscale pointer-events-none">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] card-shadow border border-slate-50 dark:border-slate-700 h-[300px] flex flex-col items-center justify-center">
                    <PieChart size={48} className="text-foreground/10" />
                </div>
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] card-shadow border border-slate-50 dark:border-slate-700 h-[300px] flex flex-col items-center justify-center">
                    <Target size={48} className="text-foreground/10" />
                </div>
            </div>
        </div>
    );
}

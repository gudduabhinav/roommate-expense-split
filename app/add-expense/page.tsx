"use client";

import { useState } from "react";
import { ArrowLeft, Camera, IndianRupee, Save, Users, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CATEGORIES = [
    { id: "food", icon: "🍔", label: "Food" },
    { id: "rent", icon: "🏠", label: "Rent" },
    { id: "electricity", icon: "⚡", label: "Elec" },
    { id: "water", icon: "💧", label: "Water" },
    { id: "groceries", icon: "🛒", label: "Groc" },
    { id: "travel", icon: "🚕", label: "Travel" },
];

export default function AddExpensePage() {
    const [amount, setAmount] = useState("");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("food");
    const [splitType, setSplitType] = useState("equal");
    const router = useRouter();

    const handleSave = () => {
        // Logic to save to Supabase
        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 p-6 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-700 md:hidden">
                <div className="flex justify-between items-center max-w-2xl mx-auto w-full">
                    <Link href="/dashboard" className="text-foreground/60">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-xl font-bold font-poppins">Add Expense</h1>
                    <button onClick={handleSave} className="text-primary font-bold">Save</button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-4 md:p-10 space-y-8">
                <div className="hidden md:flex justify-between items-center">
                    <Link href="/dashboard" className="flex items-center gap-2 text-foreground/40 hover:text-primary transition-colors">
                        <ArrowLeft size={20} /> Back to Dashboard
                    </Link>
                    <button onClick={handleSave} className="bg-primary text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all card-shadow">
                        <Save size={20} /> Save Expense
                    </button>
                </div>

                {/* Amount Input */}
                <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] card-shadow border border-slate-50 dark:border-slate-700 text-center space-y-4">
                    <p className="text-foreground/40 font-semibold uppercase tracking-widest text-xs">Enter Amount</p>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-4xl font-bold text-primary">₹</span>
                        <input
                            type="number"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="text-6xl font-bold font-poppins w-full max-w-[200px] outline-none bg-transparent placeholder:text-slate-200 dark:placeholder:text-slate-700 text-center"
                        />
                    </div>
                </div>

                {/* Details Form */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] card-shadow border border-slate-50 dark:border-slate-700 space-y-8">
                    <div className="space-y-4">
                        <label className="text-sm font-bold ml-2 text-foreground/60">Title / Description</label>
                        <input
                            type="text"
                            placeholder="What was this for?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl py-5 px-6 font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold ml-2 text-foreground/60">Category</label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border-2 ${category === cat.id ? 'bg-primary/5 border-primary text-primary' : 'bg-slate-50 dark:bg-slate-900/50 border-transparent text-foreground/40 hover:bg-slate-100'}`}
                                >
                                    <span className="text-2xl">{cat.icon}</span>
                                    <span className="text-[10px] font-bold uppercase">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-sm font-bold ml-2 text-foreground/60">Paid By</label>
                            <button className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl py-4 px-6 flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Abhinav" alt="me" />
                                    </div>
                                    <span className="font-bold">You (Abhinav)</span>
                                </div>
                                <ChevronDown size={20} className="text-foreground/20" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold ml-2 text-foreground/60">Split Type</label>
                            <div className="flex bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-1">
                                {["equal", "unequal", "percent"].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setSplitType(type)}
                                        className={`flex-grow py-3 rounded-xl text-xs font-bold uppercase transition-all ${splitType === type ? 'bg-white dark:bg-slate-800 text-primary card-shadow' : 'text-foreground/30'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold ml-2 text-foreground/60">Add Receipt</label>
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 text-foreground/30 hover:border-primary/40 hover:text-primary transition-all cursor-pointer group">
                            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Camera size={24} />
                            </div>
                            <p className="text-sm font-bold">Snap or Upload Bill</p>
                        </div>
                    </div>
                </div>

                <button onClick={handleSave} className="w-full bg-primary text-white py-5 rounded-[2rem] font-bold text-xl hover:bg-primary/90 transition-all card-shadow md:hidden">
                    Save Expense
                </button>
            </div>
        </div>
    );
}

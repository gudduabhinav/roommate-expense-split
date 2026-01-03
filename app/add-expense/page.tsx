"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Camera, IndianRupee, Save, Users, ChevronDown, Loader2, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const CATEGORIES = [
    { id: "Dining", icon: "🍴", label: "Dining" },
    { id: "Groceries", icon: "🛒", label: "Groc" },
    { id: "Electricity", icon: "⚡", label: "Elec" },
    { id: "Rent", icon: "🏠", label: "Rent" },
    { id: "Transport", icon: "🚕", label: "Travel" },
    { id: "Trip", icon: "✈️", label: "Trip" },
    { id: "Medical", icon: "🏥", label: "Med" },
    { id: "Entertainment", icon: "🍿", label: "Fun" },
    { id: "Other", icon: "📦", label: "Other" },
];

export default function AddExpensePage() {
    const [amount, setAmount] = useState("");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Dining");
    const [splitType, setSplitType] = useState("equal");
    const [groups, setGroups] = useState<any[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function fetchGroups() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('group_members')
                    .select('group_id, groups(id, name)')
                    .eq('user_id', user.id);

                if (data) {
                    const formattedGroups = data.map((item: any) => item.groups);
                    setGroups(formattedGroups);
                    if (formattedGroups.length > 0) setSelectedGroup(formattedGroups[0].id);
                }
            }
            setLoading(false);
        }
        fetchGroups();
    }, []);

    const handleSave = async () => {
        if (!amount || !title || !selectedGroup) {
            alert("Please fill all fields");
            return;
        }

        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not logged in");

            // 1. Create Expense
            const { data: expense, error: expError } = await supabase
                .from('expenses')
                .insert([{
                    group_id: selectedGroup,
                    paid_by: user.id,
                    description: title,
                    amount: parseFloat(amount),
                    category,
                    split_type: splitType
                }])
                .select()
                .single();

            if (expError) throw expError;

            // 2. Fetch Group Members for splitting
            const { data: members } = await supabase
                .from('group_members')
                .select('user_id')
                .eq('group_id', selectedGroup);

            if (members && members.length > 0) {
                const splitAmount = parseFloat(amount) / members.length;
                const splits = members.map(m => ({
                    expense_id: expense.id,
                    user_id: m.user_id,
                    amount: splitAmount
                }));

                const { error: splitError } = await supabase
                    .from('expense_splits')
                    .insert(splits);

                if (splitError) throw splitError;
            }

            router.push(`/group/${selectedGroup}`);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-32">
            <div className="max-w-2xl mx-auto p-4 md:p-10 space-y-10">
                <Link href="/dashboard" className="flex items-center gap-2 text-foreground/40 hover:text-primary transition-colors group w-fit">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold font-poppins text-xs uppercase tracking-widest">Back to Life</span>
                </Link>

                <div className="space-y-2">
                    <h1 className="text-4xl md:text-5xl font-bold font-poppins tracking-tight">Record Spending</h1>
                    <p className="text-foreground/40 text-lg">Who paid and how are we splitting this?</p>
                </div>

                {/* Amount Section */}
                <div className="bg-white dark:bg-slate-800 p-12 rounded-[3.5rem] card-shadow border border-slate-100 dark:border-slate-800 text-center space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">Total Bill Amount</p>
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-5xl font-black text-primary font-poppins">₹</span>
                        <input
                            type="number"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="text-7xl font-black font-poppins w-full max-w-[280px] outline-none bg-transparent placeholder:text-slate-100 dark:placeholder:text-slate-700 text-center"
                        />
                    </div>
                </div>

                {/* Details Form */}
                <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[3.5rem] card-shadow border border-slate-100 dark:border-slate-800 space-y-10">
                    {/* Description */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-foreground/40">Description</label>
                        <input
                            type="text"
                            placeholder="Dinner at Social, Milk & Eggs..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary/20 rounded-[1.5rem] py-6 px-8 text-xl font-bold focus:ring-0 transition-all outline-none"
                        />
                    </div>

                    {/* Group Selection */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-foreground/40">Select Circle</label>
                        <div className="relative">
                            <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20" size={24} />
                            <select
                                value={selectedGroup}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary/20 rounded-[1.5rem] py-6 pl-16 pr-6 appearance-none font-bold text-lg outline-none cursor-pointer"
                            >
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-foreground/20 pointer-events-none" size={24} />
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-foreground/40">Category</label>
                        <div className="grid grid-cols-3 gap-3">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={`flex flex-col items-center gap-2 p-5 rounded-[1.5rem] transition-all border-2 ${category === cat.id ? 'bg-primary/5 border-primary text-primary scale-[1.05]' : 'bg-transparent border-slate-50 dark:border-slate-800 text-foreground/20 hover:border-primary/10'}`}
                                >
                                    <span className="text-3xl">{cat.icon}</span>
                                    <span className="text-[10px] font-black uppercase tracking-tighter">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Split Strategy */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-foreground/40">Split Strategy</label>
                        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-[1.5rem] p-1.5">
                            {["equal", "unequal", "percent"].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSplitType(type)}
                                    className={`flex-grow py-4 rounded-[1.1rem] text-[10px] font-black uppercase tracking-widest transition-all ${splitType === type ? 'bg-white dark:bg-slate-800 text-primary shadow-lg scale-[1.02]' : 'text-foreground/30 hover:text-foreground/50'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving || !amount || !title}
                        className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xl hover:bg-primary/90 transition-all card-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-primary/30"
                    >
                        {saving ? <Loader2 className="animate-spin" size={24} /> : (
                            <>
                                Record & Split <Check size={24} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

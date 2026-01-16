"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, IndianRupee, Save, Users, ChevronDown, Loader2, Check, AlertCircle, Calendar, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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

export default function EditExpensePage() {
    const { id: expenseId } = useParams();
    const [amount, setAmount] = useState("");
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState("Dining");
    const [splitType, setSplitType] = useState("equal");
    const [groups, setGroups] = useState<any[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/auth');
                    return;
                }

                // 1. Fetch the expense to edit
                const { data: expense, error: expError } = await supabase
                    .from('expenses')
                    .select('*')
                    .eq('id', expenseId)
                    .single();

                if (expError || !expense) {
                    alert("Expense not found");
                    router.back();
                    return;
                }

                // Security Check: Only payer or owner can edit (Simplified for now, UI also hides it)
                if (expense.paid_by !== user.id) {
                    // Check if group owner (optional extra check)
                }

                setAmount(expense.amount.toString());
                setTitle(expense.description);
                setCategory(expense.category);
                setSplitType(expense.split_type);
                setSelectedGroup(expense.group_id);
                if (expense.date) {
                    setDate(new Date(expense.date).toISOString().split('T')[0]);
                }

                // 2. Fetch groups for the dropdown
                const { data: groupsData } = await supabase
                    .from('groups')
                    .select('id, name')
                    .order('created_at', { ascending: false });

                if (groupsData) setGroups(groupsData);

            } catch (err: any) {
                console.error("Fetch Data Error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [expenseId, router]);

    const handleUpdate = async () => {
        if (!amount || !title || !selectedGroup) {
            alert("Please fill all fields");
            return;
        }

        setSaving(true);
        try {
            // 1. Update Expense
            const { error: updateError } = await supabase
                .from('expenses')
                .update({
                    description: title,
                    amount: parseFloat(amount),
                    category,
                    date: new Date(date).toISOString(),
                    split_type: splitType,
                    group_id: selectedGroup
                })
                .eq('id', expenseId);

            if (updateError) throw updateError;

            // 2. Fetch Group Members to update splits
            const { data: members } = await supabase
                .from('group_members')
                .select('user_id')
                .eq('group_id', selectedGroup);

            if (members && members.length > 0) {
                // Remove old splits
                await supabase.from('expense_splits').delete().eq('expense_id', expenseId);

                // Re-create splits
                const splitAmount = parseFloat(amount) / members.length;
                const splits = members.map(m => ({
                    expense_id: expenseId,
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
            <div className="max-w-2xl mx-auto px-2 py-4 md:p-10 space-y-10">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-foreground/40 hover:text-primary transition-colors group w-fit ml-2">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold font-poppins text-[10px] uppercase tracking-widest">Back to Ledger</span>
                </button>

                <div className="space-y-2 px-2">
                    <h1 className="text-3xl md:text-5xl font-bold font-poppins tracking-tight text-slate-900 dark:text-white">Edit Record</h1>
                    <p className="text-foreground/40 text-base md:text-lg">Correcting a mistake? No worries.</p>
                </div>

                {/* Amount Section */}
                <div className="bg-white dark:bg-slate-800 p-6 md:p-12 rounded-3xl md:rounded-[3.5rem] card-shadow border border-slate-100 dark:border-slate-800 text-center space-y-4 relative overflow-hidden mx-1">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">Updated Amount</p>
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-3xl md:text-5xl font-black text-primary font-poppins">₹</span>
                        <input
                            type="number"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="text-5xl md:text-7xl font-black font-poppins w-full max-w-[280px] outline-none bg-transparent placeholder:text-slate-100 dark:placeholder:text-slate-800 text-center text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                {/* Details Form */}
                <div className="bg-white dark:bg-slate-800 p-5 md:p-12 rounded-3xl md:rounded-[3.5rem] card-shadow border border-slate-100 dark:border-slate-800 space-y-8 md:space-y-10 mx-1">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-foreground/40">Description</label>
                        <input
                            type="text"
                            placeholder="Dinner, Groceries..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary/20 rounded-2xl md:rounded-[1.5rem] py-4 md:py-6 px-6 md:px-8 text-lg md:text-xl font-bold focus:ring-0 transition-all outline-none text-slate-900 dark:text-white"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-foreground/40">Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary/20 rounded-2xl md:rounded-[1.5rem] py-4 md:py-6 px-6 md:px-8 text-lg md:text-xl font-bold focus:ring-0 transition-all outline-none text-slate-900 dark:text-white"
                            />
                            <Calendar className="absolute right-8 top-1/2 -translate-y-1/2 text-foreground/20 pointer-events-none" size={24} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-foreground/40">Group</label>
                        <div className="relative">
                            <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20" size={24} />
                            <select
                                value={selectedGroup}
                                onChange={(e) => setSelectedGroup(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary/20 rounded-2xl md:rounded-[1.5rem] py-4 md:py-6 pl-14 md:pl-16 pr-6 appearance-none font-bold text-base md:text-lg outline-none cursor-pointer text-slate-900 dark:text-white"
                            >
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-foreground/20 pointer-events-none" size={24} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-foreground/40">Category</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={`flex items-center gap-3 p-4 rounded-2xl transition-all border-2 text-xs sm:text-sm font-bold ${category === cat.id ? 'bg-primary border-primary text-white scale-[1.02]' : 'bg-transparent border-slate-50 dark:border-slate-800 text-foreground/20 hover:border-primary/10'}`}
                                >
                                    <span className="text-2xl shrink-0">{cat.icon}</span>
                                    <span className="truncate font-black uppercase tracking-tighter">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleUpdate}
                        disabled={saving || !amount || !title}
                        className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xl hover:bg-primary/90 transition-all card-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-primary/30 active:scale-95"
                    >
                        {saving ? <Loader2 className="animate-spin" size={24} /> : (
                            <>
                                Update Record <Save size={24} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

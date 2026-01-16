"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Camera, IndianRupee, Save, Users, ChevronDown, Loader2, Check, AlertCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGroupNotifications } from "@/lib/hooks/useGroupNotifications";
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
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState("Dining");
    const [splitType, setSplitType] = useState("equal");
    const [groups, setGroups] = useState<any[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();
    const { sendExpenseNotification } = useGroupNotifications();

    useEffect(() => {
        async function fetchGroups() {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/auth');
                    return;
                }

                // Fetch groups directly (same as groups page)
                const { data: groupsData, error: groupsError } = await supabase
                    .from('groups')
                    .select('id, name, category')
                    .order('created_at', { ascending: false });

                if (groupsError) {
                    console.error("Groups fetch error:", groupsError);
                }

                if (groupsData && groupsData.length > 0) {
                    setGroups(groupsData);
                    setSelectedGroup(groupsData[0].id);
                } else {
                    setGroups([]);
                }
            } catch (err: any) {
                console.error("Fetch Groups Error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchGroups();
    }, [router]);

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
                    date: new Date(date).toISOString(),
                    split_type: splitType
                }])
                .select()
                .single();

            if (expError) throw expError;

            // 2. Fetch Group Members for splitting & notifications
            const { data: members } = await supabase
                .from('group_members')
                .select('user_id')
                .eq('group_id', selectedGroup);

            if (members && members.length > 0) {
                // Splits
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

                // Notifications (In-app for all members except sender)
                const notifications = members
                    .filter(m => m.user_id !== user.id)
                    .map(m => ({
                        user_id: m.user_id,
                        title: "New Expense Added",
                        message: `A bill of ₹${amount} for "${title}" has been recorded.`,
                        type: 'expense'
                    }));

                if (notifications.length > 0) {
                    await supabase.from('notifications').insert(notifications);
                }

                // Send Push Notifications via notification service
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single();

                const userName = userProfile?.full_name || 'Someone';
                await sendExpenseNotification(selectedGroup, title, parseFloat(amount), userName);
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
                <Link href="/dashboard" className="flex items-center gap-2 text-foreground/40 hover:text-primary transition-colors group w-fit ml-2">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold font-poppins text-[10px] uppercase tracking-widest">Back to Life</span>
                </Link>

                <div className="space-y-2 px-2">
                    <h1 className="text-4xl md:text-5xl font-bold font-poppins tracking-tight text-slate-900 dark:text-white">Record Spending</h1>
                    <p className="text-foreground/40 text-lg">Who paid and how are we splitting this?</p>
                </div>

                {/* Amount Section */}
                <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] card-shadow border border-slate-100 dark:border-slate-800 text-center space-y-4 relative overflow-hidden mx-1">
                    <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">Total Bill Amount</p>
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-4xl md:text-5xl font-black text-primary font-poppins">₹</span>
                        <input
                            type="number"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="text-6xl md:text-7xl font-black font-poppins w-full max-w-[280px] outline-none bg-transparent placeholder:text-slate-100 dark:placeholder:text-slate-800 text-center text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                {/* Details Form */}
                <div className="bg-white dark:bg-slate-800 p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] card-shadow border border-slate-100 dark:border-slate-800 space-y-10 mx-1">
                    {/* Description */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-foreground/40">Description</label>
                        <input
                            type="text"
                            placeholder="Dinner at Social, Milk & Eggs..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary/20 rounded-[1.5rem] py-6 px-8 text-xl font-bold focus:ring-0 transition-all outline-none text-slate-900 dark:text-white"
                        />
                    </div>

                    {/* Date Picker */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-foreground/40">Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary/20 rounded-[1.5rem] py-6 px-8 text-xl font-bold focus:ring-0 transition-all outline-none text-slate-900 dark:text-white"
                            />
                            <Calendar className="absolute right-8 top-1/2 -translate-y-1/2 text-foreground/20 pointer-events-none" size={24} />
                        </div>
                    </div>

                    {/* Group Selection */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-foreground/40">Select Group</label>
                        {groups.length === 0 ? (
                            <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-[1.5rem] border border-amber-200 dark:border-amber-800/50 flex items-center gap-4 text-amber-800 dark:text-amber-400 font-bold">
                                <AlertCircle className="shrink-0" size={20} />
                                <div>
                                    <p className="text-sm">No Groups Found</p>
                                    <Link href="/groups/new" className="text-xs underline">Create or Join a group first!</Link>
                                </div>
                            </div>
                        ) : (
                            <div className="relative">
                                <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20" size={24} />
                                <select
                                    value={selectedGroup}
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent focus:border-primary/20 rounded-[1.5rem] py-6 pl-16 pr-6 appearance-none font-bold text-lg outline-none cursor-pointer text-slate-900 dark:text-white"
                                >
                                    {groups.map(g => (
                                        <option key={g.id} value={g.id} className="dark:bg-slate-900">{g.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-foreground/20 pointer-events-none" size={24} />
                            </div>
                        )}
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-foreground/40">Category</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-1">
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
                        disabled={saving || !amount || !title || !selectedGroup}
                        className="w-full bg-primary text-white py-6 rounded-[2rem] font-black text-xl hover:bg-primary/90 transition-all card-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-primary/30 active:scale-95"
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

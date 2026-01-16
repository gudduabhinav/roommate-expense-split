"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
    Users,
    ArrowLeft,
    Loader2,
    Check,
    Home,
    Plane,
    Heart,
    ShoppingBag,
    Utensils,
    Car,
    MoreHorizontal,
    ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function NewGroupPage() {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("Home");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const categories = [
        { name: "Home", icon: <Home size={18} /> },
        { name: "Trip", icon: <Plane size={18} /> },
        { name: "Couple", icon: <Heart size={18} /> },
        { name: "Groceries", icon: <ShoppingBag size={18} /> },
        { name: "Dining", icon: <Utensils size={18} /> },
        { name: "Transport", icon: <Car size={18} /> },
        { name: "Other", icon: <MoreHorizontal size={18} /> },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Please log in to create a group");

            // Generate a random 8-character invite code
            const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

            // 1. Create the group
            const { data: group, error: groupError } = await supabase
                .from('groups')
                .insert([{
                    name,
                    category,
                    created_by: user.id,
                    invite_code: inviteCode
                }])
                .select()
                .single();

            if (groupError) throw groupError;

            // 2. Add creator as a member (Owner)
            const { error: memberError } = await supabase
                .from('group_members')
                .insert([{
                    group_id: group.id,
                    user_id: user.id,
                    role: 'owner'
                }]);

            if (memberError) throw memberError;

            setSuccess(true);
            setTimeout(() => {
                router.push(`/group/${group.id}`);
            }, 2000);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Failed to create group. Make sure your Supabase tables are set up!");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6 text-center px-6">
                <div className="w-24 h-24 bg-success/20 text-success rounded-full flex items-center justify-center animate-bounce shadow-2xl">
                    <Check size={48} strokeWidth={3} />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold font-poppins">Group Born! 🚀</h1>
                    <p className="text-foreground/50 max-w-sm">Setting up your shared workspace and preparing the invitation links...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-2 py-4 md:p-10 space-y-8 pb-32">
            <Link href="/groups" className="flex items-center gap-2 text-foreground/50 hover:text-primary transition-colors group w-fit ml-2">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold font-poppins text-[10px] uppercase tracking-widest">Groups</span>
            </Link>

            <div className="space-y-3 px-2">
                <h1 className="text-4xl md:text-5xl font-bold font-poppins tracking-tight text-slate-900 dark:text-white">New Group</h1>
                <p className="text-foreground/50 text-lg">Give your squad a name and choose its vibe.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 md:p-12 rounded-[3rem] md:rounded-[3.5rem] card-shadow border border-slate-100 dark:border-slate-800 space-y-10 animate-in fade-in slide-in-from-bottom duration-700 mx-1 md:mx-0">
                {/* Name Input */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 block ml-4">Group Name</label>
                    <div className="relative group">
                        <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary transition-colors" size={24} />
                        <input
                            type="text"
                            placeholder="e.g. Goa Trip 💸"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary/20 rounded-[2rem] py-6 pl-16 pr-6 transition-all outline-none text-xl font-bold font-poppins text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                {/* Category Grid */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 block ml-4">Select Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-1">
                        {categories.map((c) => (
                            <button
                                key={c.name}
                                type="button"
                                onClick={() => setCategory(c.name)}
                                className={`flex items-center gap-2 px-3 py-4 rounded-2xl text-xs sm:text-sm font-bold transition-all border-2 ${category === c.name
                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                                    : "bg-transparent border-slate-50 dark:border-slate-800 text-foreground/40 hover:border-primary/20"
                                    }`}
                            >
                                <span className={`shrink-0 ${category === c.name ? "text-white" : "text-primary/60"}`}>
                                    {c.icon}
                                </span>
                                <span className="truncate">{c.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || !name}
                    className="w-full bg-primary text-white py-6 rounded-[2.5rem] font-bold text-xl hover:bg-primary/90 transition-all card-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group shadow-[0_20px_40px_-15px_rgba(99,102,241,0.5)] active:scale-95"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={28} />
                    ) : (
                        <>
                            Create Group <ArrowRight size={24} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

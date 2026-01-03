"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Users, ArrowLeft, Loader2, Check } from "lucide-react";
import Link from "next/link";

export default function NewGroupPage() {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("Apartment");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const categories = ["Apartment", "House", "Trip", "Couple", "Other"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            // 1. Create the group
            const { data: group, error: groupError } = await supabase
                .from('groups')
                .insert([{ name, category, created_by: user.id }])
                .select()
                .single();

            if (groupError) throw groupError;

            // 2. Add creator as a member
            const { error: memberError } = await supabase
                .from('group_members')
                .insert([{ group_id: group.id, user_id: user.id, role: 'owner' }]);

            if (memberError) throw memberError;

            setSuccess(true);
            setTimeout(() => {
                router.push(`/group/${group.id}`);
            }, 1500);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6">
                <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center text-white animate-bounce shadow-xl">
                    <Check size={40} strokeWidth={3} />
                </div>
                <h1 className="text-3xl font-bold font-poppins">Group Created!</h1>
                <p className="text-foreground/50">Taking you to your new circle...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-10 space-y-8 pb-32">
            <Link href="/groups" className="flex items-center gap-2 text-foreground/50 hover:text-primary transition-colors group w-fit">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Groups</span>
            </Link>

            <div className="space-y-2">
                <h1 className="text-4xl font-bold font-poppins">Create New Group</h1>
                <p className="text-foreground/50">Establish a new circle to start splitting bills.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] card-shadow border border-slate-100 dark:border-slate-800 space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
                <div className="space-y-4">
                    <label className="text-sm font-bold uppercase tracking-widest text-foreground/40 block ml-2">Group Name</label>
                    <div className="relative">
                        <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/30" size={24} />
                        <input
                            type="text"
                            placeholder="e.g. Dream House, Euro Trip 2026"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl py-6 pl-16 pr-6 focus:ring-4 focus:ring-primary/10 transition-all outline-none text-lg font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-bold uppercase tracking-widest text-foreground/40 block ml-2">Category</label>
                    <div className="flex flex-wrap gap-3">
                        {categories.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setCategory(c)}
                                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all border-2 ${category === c
                                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/30"
                                        : "bg-transparent border-slate-100 dark:border-slate-800 text-foreground/40 hover:border-primary/30"
                                    }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !name}
                    className="w-full bg-primary text-white py-6 rounded-[2rem] font-bold text-xl hover:bg-primary/90 transition-all card-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : (
                        <>
                            Start Group <Check size={24} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

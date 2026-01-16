"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Search, MoreVertical, ArrowUpRight, ArrowDownLeft, Filter, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function GroupsPage() {
    const router = useRouter();
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function fetchGroups() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from('groups')
                    .select(`
                        *,
                        members:group_members(count)
                    `)
                    .order('created_at', { ascending: false });

                if (data) setGroups(data);
            }
            setLoading(false);
        }
        fetchGroups();
    }, []);

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-foreground">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-foreground/40 font-medium animate-pulse uppercase tracking-widest text-xs">Loading groups...</p>
            </div>
        );
    }

    return (
        <div className="px-2 py-4 md:px-10 md:py-10 space-y-6 md:space-y-8 pb-32 md:pb-10 text-foreground">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2 md:px-0">
                <div>
                    <h1 className="text-3xl font-bold font-poppins">Your Groups</h1>
                    <p className="text-foreground/50">Manage your shared expenses with ease.</p>
                </div>
                <Link href="/groups/new" className="bg-primary text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all card-shadow">
                    <Plus size={20} /> Create New Group
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-3xl md:rounded-[2rem] card-shadow border border-slate-50 dark:border-slate-700">
                    <p className="text-foreground/40 text-[10px] font-bold uppercase tracking-wider mb-2">Total Groups</p>
                    <p className="text-2xl font-bold font-poppins">{groups.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-3xl md:rounded-[2rem] card-shadow border border-slate-50 dark:border-slate-700 opacity-50">
                    <p className="text-danger/60 text-[10px] font-bold uppercase tracking-wider mb-2">You Owe</p>
                    <p className="text-2xl font-bold font-poppins text-danger">₹0</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-3xl md:rounded-[2rem] card-shadow border border-slate-50 dark:border-slate-700 opacity-50">
                    <p className="text-success/60 text-[10px] font-bold uppercase tracking-wider mb-2">You're Owed</p>
                    <p className="text-2xl font-bold font-poppins text-success">₹0</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-3xl md:rounded-[2rem] card-shadow border border-slate-50 dark:border-slate-700 opacity-50">
                    <p className="text-primary/60 text-[10px] font-bold uppercase tracking-wider mb-2">Net Balance</p>
                    <p className="text-2xl font-bold font-poppins text-primary">₹0</p>
                </div>
            </div>

            {/* Search & Manual Join */}
            <div className="flex flex-col md:flex-row gap-4 px-1 md:px-0">
                <div className="relative flex-grow">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={20} />
                    <input
                        type="text"
                        placeholder="Search your groups..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none card-shadow"
                    />
                </div>

                {/* Manual Join Box */}
                <div className="flex gap-2 bg-white dark:bg-slate-800 p-2 rounded-[1.5rem] card-shadow border border-slate-100 dark:border-slate-700">
                    <input
                        type="text"
                        placeholder="Join by Code (X8Y2)"
                        id="manualJoinCode"
                        className="bg-transparent border-none outline-none px-4 font-mono font-bold uppercase w-44 text-sm focus:ring-0"
                    />
                    <button
                        onClick={() => {
                            const code = (document.getElementById('manualJoinCode') as HTMLInputElement).value;
                            if (code) router.push(`/join/${code.toUpperCase().trim()}`);
                        }}
                        className="bg-primary text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-md active:scale-95"
                    >
                        Join
                    </button>
                </div>

                <button className="hidden md:block bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-50 dark:border-slate-700 text-foreground/60 hover:text-primary transition-colors card-shadow">
                    <Filter size={20} />
                </button>
            </div>

            {/* Groups Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.length === 0 && searchQuery === "" ? (
                    <div className="col-span-full py-20 bg-white/40 dark:bg-slate-800/40 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <Users size={48} />
                        </div>
                        <div className="space-y-1 px-6">
                            <h3 className="text-xl font-bold font-poppins">No groups yet</h3>
                            <p className="text-foreground/40 max-w-xs">Create your first group or join one using a code!</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {filteredGroups.map((group) => (
                            <Link
                                key={group.id}
                                href={`/group/${group.id}`}
                                className="group bg-white dark:bg-slate-800 p-5 md:p-6 rounded-3xl md:rounded-[2.5rem] card-shadow border border-slate-50 dark:border-slate-700 hover:scale-[1.02] transition-all block relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                    < MoreVertical className="text-foreground/20" />
                                </div>

                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
                                        <Users size={28} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold font-poppins">{group.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md text-foreground/50">
                                                {group.category || 'General'}
                                            </span>
                                            <span className="text-[10px] text-foreground/30 font-medium">
                                                • {group.members?.[0]?.count || 0} members
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold uppercase text-foreground/30 tracking-wider">Group Total</p>
                                            <p className="text-lg font-bold">₹{(group.total || 0).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right space-y-1 opacity-50">
                                            <p className="text-[10px] font-bold uppercase text-foreground/30 tracking-wider">Your Balance</p>
                                            <p className="font-bold flex items-center gap-1 justify-end text-foreground/40">
                                                ₹0
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 overflow-hidden ring-2 ring-transparent group-hover:ring-primary/20 transition-all font-bold flex items-center justify-center text-[10px] text-foreground/20">
                                                    ?
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-xs font-medium text-foreground/40">Open Details</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        <Link href="/groups/new" className="group border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-foreground/30 hover:text-primary hover:border-primary/40 transition-all hover:bg-primary/5 min-h-[200px] md:min-h-[250px]">
                            <div className="w-16 h-16 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Plus size={32} />
                            </div>
                            <div className="text-center">
                                <span className="font-bold text-lg block">Create New Group</span>
                                <span className="text-sm">Start splitting with friends</span>
                            </div>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

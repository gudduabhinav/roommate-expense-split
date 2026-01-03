"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Users, CheckCircle2, Loader2, ArrowRight, ShieldAlert, Sparkles, LogIn } from "lucide-react";
import Link from "next/link";

export default function JoinGroupPage() {
    const { inviteCode } = useParams();
    const router = useRouter();
    const [group, setGroup] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [alreadyMember, setAlreadyMember] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        async function checkSession() {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
        }
        checkSession();
    }, []);

    useEffect(() => {
        async function fetchGroupByInvite() {
            if (!inviteCode) return;
            setLoading(true);
            setError(null);

            try {
                // 1. Fetch group - using case-insensitive check if possible, or exact match
                const cleanedCode = Array.isArray(inviteCode) ? inviteCode[0].toUpperCase() : inviteCode.toUpperCase();

                const { data: groupData, error: groupError } = await supabase
                    .from('groups')
                    .select('*')
                    .eq('invite_code', cleanedCode)
                    .single();

                if (groupError || !groupData) {
                    setError("Invalid invite link or the circle was deleted. Please check the code and try again.");
                    setLoading(false);
                    return;
                }

                setGroup(groupData);

                // 2. Check membership if logged in
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: memberData } = await supabase
                        .from('group_members')
                        .select('*')
                        .eq('group_id', groupData.id)
                        .eq('user_id', user.id)
                        .maybeSingle();

                    if (memberData) {
                        setAlreadyMember(true);
                    }
                }
            } catch (err: any) {
                console.error("Join Error:", err);
                setError("Something went wrong while verifying this invite.");
            } finally {
                setLoading(false);
            }
        }
        fetchGroupByInvite();
    }, [inviteCode, isLoggedIn]);

    const handleJoin = async () => {
        if (!isLoggedIn) {
            router.push(`/auth?redirect=/join/${inviteCode}`);
            return;
        }

        setJoining(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication failed");

            // Join logic
            const { error: joinError } = await supabase
                .from('group_members')
                .insert([{
                    group_id: group.id,
                    user_id: user.id,
                    role: 'member'
                }]);

            if (joinError) {
                // Check if error is because they are already a member (concurrency check)
                if (joinError.code === '23505') {
                    setAlreadyMember(true);
                } else {
                    throw joinError;
                }
            }

            router.push(`/group/${group.id}`);
        } catch (err: any) {
            alert("Failed to join: " + err.message);
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <Users className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={32} />
                </div>
                <p className="text-foreground/40 font-black uppercase tracking-[0.3em] text-[10px]">Verifying Invitation...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-8 relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-danger/5 rounded-full blur-3xl" />
                <div className="w-24 h-24 bg-danger/10 text-danger rounded-[2rem] flex items-center justify-center rotate-12 relative z-10">
                    <ShieldAlert size={48} />
                </div>
                <div className="space-y-4 relative z-10">
                    <h1 className="text-4xl font-bold font-poppins text-slate-900 dark:text-white">Invite Error</h1>
                    <p className="text-foreground/40 max-w-sm mx-auto font-medium">{error}</p>
                </div>
                <Link href="/dashboard" className="bg-slate-200 dark:bg-slate-800 px-10 py-5 rounded-[1.5rem] font-bold text-foreground/60 hover:text-primary hover:bg-primary/10 transition-all relative z-10 uppercase tracking-widest text-xs">
                    Return Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
            {/* Ambient Background */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-40" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] opacity-40" />

            <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[3.5rem] p-10 md:p-14 card-shadow border border-white dark:border-slate-800 text-center space-y-10 relative z-10 animate-in fade-in zoom-in duration-700">
                <div className="space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-[2.5rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-primary/40 -rotate-3 hover:rotate-0 transition-transform duration-500 ring-8 ring-primary/5">
                        <Users size={48} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                            <Sparkles size={16} className="text-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">New Circle Invite</span>
                        </div>
                        <h1 className="text-4xl font-black font-poppins tracking-tight text-slate-900 dark:text-white">Join {group.name}</h1>
                        <p className="text-foreground/40 text-sm font-medium">Click below to participate in this circle.</p>
                    </div>
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 space-y-6">
                    <div className="flex justify-between items-center text-left">
                        <div>
                            <p className="text-[10px] font-black uppercase text-foreground/20 tracking-widest mb-1">Circle Category</p>
                            <p className="font-bold text-lg">{group.category || 'General'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-foreground/20 tracking-widest mb-1">Invite Code</p>
                            <p className="font-bold text-lg font-mono text-primary">{group.invite_code}</p>
                        </div>
                    </div>
                </div>

                {isLoggedIn === false ? (
                    <div className="space-y-6">
                        <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-200 dark:border-amber-800/50 text-left">
                            <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Login Required</p>
                            <p className="text-xs text-amber-700/60 dark:text-amber-500/60">Please log in to your account to join this circle.</p>
                        </div>
                        <button
                            onClick={handleJoin}
                            className="w-full bg-primary text-white py-6 rounded-[2.5rem] font-black text-xl hover:bg-primary/90 transition-all card-shadow flex items-center justify-center gap-4 shadow-xl shadow-primary/30"
                        >
                            Log in & Join <LogIn size={24} />
                        </button>
                    </div>
                ) : alreadyMember ? (
                    <div className="space-y-6">
                        <div className="p-6 bg-success/10 rounded-3xl border border-success/20 flex items-center gap-4 text-left">
                            <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center shrink-0">
                                <CheckCircle2 size={24} className="text-success" />
                            </div>
                            <p className="text-sm font-bold text-success/80">You're already in this circle!</p>
                        </div>
                        <Link
                            href={`/group/${group.id}`}
                            className="w-full bg-primary text-white py-6 rounded-[2.5rem] font-black text-xl hover:bg-primary/90 transition-all card-shadow flex items-center justify-center gap-4 shadow-xl shadow-primary/30"
                        >
                            Go to Dashboard <ArrowRight size={24} />
                        </Link>
                    </div>
                ) : (
                    <button
                        onClick={handleJoin}
                        disabled={joining}
                        className="w-full bg-primary text-white py-6 rounded-[2.5rem] font-black text-xl hover:bg-primary/90 transition-all card-shadow disabled:opacity-50 flex items-center justify-center gap-4 shadow-xl shadow-primary/30 active:scale-95"
                    >
                        {joining ? <Loader2 className="animate-spin" size={24} /> : (
                            <>
                                Accept & Join <CheckCircle2 size={24} />
                            </>
                        )}
                    </button>
                )}

                <Link href="/dashboard" className="block text-[10px] font-black uppercase tracking-widest text-foreground/20 hover:text-primary transition-colors">
                    No thanks, return home
                </Link>
            </div>
        </div>
    );
}

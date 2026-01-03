"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Users, CheckCircle2, Loader2, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import Link from "next/link";

export default function JoinGroupPage() {
    const { inviteCode } = useParams();
    const router = useRouter();
    const [group, setGroup] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [alreadyMember, setAlreadyMember] = useState(false);

    useEffect(() => {
        async function fetchGroupByInvite() {
            setLoading(true);
            try {
                // 1. Fetch group
                const { data: groupData, error: groupError } = await supabase
                    .from('groups')
                    .select('*')
                    .eq('invite_code', inviteCode)
                    .single();

                if (groupError || !groupData) {
                    setError("Invalid invite link. Please check the code and try again.");
                    setLoading(false);
                    return;
                }

                setGroup(groupData);

                // 2. Check membership
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: memberData } = await supabase
                        .from('group_members')
                        .select('*')
                        .eq('group_id', groupData.id)
                        .eq('user_id', user.id)
                        .single();

                    if (memberData) {
                        setAlreadyMember(true);
                    }
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchGroupByInvite();
    }, [inviteCode]);

    const handleJoin = async () => {
        setJoining(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Redirect to login but keep the invite code
                router.push(`/auth?redirect=/join/${inviteCode}`);
                return;
            }

            // Join the group
            const { error: joinError } = await supabase
                .from('group_members')
                .insert([{
                    group_id: group.id,
                    user_id: user.id,
                    role: 'member'
                }]);

            if (joinError) throw joinError;

            router.push(`/group/${group.id}`);
        } catch (err: any) {
            alert(err.message);
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
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-8">
                <div className="w-24 h-24 bg-danger/10 text-danger rounded-[2rem] flex items-center justify-center rotate-12">
                    <ShieldAlert size={48} />
                </div>
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold font-poppins">Invite Error</h1>
                    <p className="text-foreground/40 max-w-sm mx-auto">{error}</p>
                </div>
                <Link href="/dashboard" className="bg-slate-100 dark:bg-slate-800 px-8 py-4 rounded-2xl font-bold text-foreground/60 hover:text-primary transition-all">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 md:p-14 card-shadow border border-slate-100 dark:border-slate-800 text-center space-y-10 relative z-10 animate-in fade-in zoom-in duration-700">
                <div className="space-y-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-[2.5rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-primary/30 -rotate-3 hover:rotate-0 transition-transform duration-500">
                        <Users size={48} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                            <Sparkles size={16} className="text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">New Invitation</span>
                        </div>
                        <h1 className="text-4xl font-bold font-poppins tracking-tight">Join {group.name}</h1>
                        <p className="text-foreground/40 text-sm">You've been invited to join this expense circle.</p>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex justify-between items-center text-left">
                        <div>
                            <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Category</p>
                            <p className="font-bold text-lg">{group.category || 'General'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">Code</p>
                            <p className="font-bold text-lg font-mono">{group.invite_code}</p>
                        </div>
                    </div>
                </div>

                {alreadyMember ? (
                    <div className="space-y-6">
                        <div className="p-5 bg-success/10 rounded-2xl border border-success/20 flex items-center gap-4 text-left">
                            <CheckCircle2 size={24} className="text-success shrink-0" />
                            <p className="text-sm font-bold text-success/80">You are already a member of this circle.</p>
                        </div>
                        <Link
                            href={`/group/${group.id}`}
                            className="w-full bg-primary text-white py-6 rounded-[2rem] font-bold text-xl hover:bg-primary/90 transition-all card-shadow flex items-center justify-center gap-3 shadow-lg shadow-primary/30"
                        >
                            Go to Circle <ArrowRight size={24} />
                        </Link>
                    </div>
                ) : (
                    <button
                        onClick={handleJoin}
                        disabled={joining}
                        className="w-full bg-primary text-white py-6 rounded-[2rem] font-bold text-xl hover:bg-primary/90 transition-all card-shadow disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {joining ? <Loader2 className="animate-spin" size={24} /> : (
                            <>
                                Join Circle <ArrowRight size={24} />
                            </>
                        )}
                    </button>
                )}

                <Link href="/dashboard" className="block text-[10px] font-black uppercase tracking-widest text-foreground/20 hover:text-primary transition-colors">
                    Decline & Return Home
                </Link>
            </div>
        </div>
    );
}

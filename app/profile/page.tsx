"use client";

import { LogOut, Settings, Bell, Shield, Moon, Download, CreditCard, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ groups: 0, friends: 0, totalSplit: 0 });

    useEffect(() => {
        async function getProfile() {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    // Try to get profile from database
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    // Prioritize Name: 1. Profile DB, 2. Auth Metadata, 3. Email Prefix
                    const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0];
                    const firstName = profile?.first_name || user.user_metadata?.first_name || fullName?.split(' ')[0];

                    setUser({ ...user, ...profile, display_name: fullName, first_name: firstName });

                    // Fetch real stats
                    const { count: groupCount } = await supabase
                        .from('group_members')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user.id);

                    const { data: expenses } = await supabase
                        .from('expenses')
                        .select('amount')
                        .eq('paid_by', user.id);

                    const total = expenses?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

                    setStats({
                        groups: groupCount || 0,
                        friends: 0, // Need a friends/contacts table for this
                        totalSplit: total
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        getProfile();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    const toggleSettings = () => {
        alert("Settings module coming soon!");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="px-2 py-4 md:px-10 md:py-10 space-y-10 pb-32 text-foreground">
            <h1 className="text-3xl font-bold font-poppins text-foreground px-2">Profile</h1>

            {/* User Card */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] card-shadow border border-slate-50 dark:border-slate-700 flex flex-col md:flex-row items-center gap-8 text-center md:text-left transition-all hover:border-primary/20 mx-1 md:mx-0">
                <div className="w-24 h-24 rounded-[2rem] bg-primary/10 p-2 overflow-hidden ring-4 ring-primary/5">
                    <img
                        src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.first_name || 'User'}`}
                        alt="profile"
                        className="w-full h-full rounded-2xl object-cover"
                    />
                </div>
                <div className="flex-grow space-y-2">
                    <h2 className="text-2xl font-bold font-poppins capitalize">{user?.display_name}</h2>
                    <p className="text-foreground/40 font-medium">{user?.email}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                        <span className="bg-success/10 text-success text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Verified User</span>
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Member</span>
                    </div>
                </div>
                <button
                    onClick={toggleSettings}
                    className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all group border border-transparent hover:border-primary/20"
                >
                    <Settings className="text-foreground/40 group-hover:text-primary" />
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-1 md:px-0">
                {[
                    { label: "Groups", value: stats.groups, icon: "👥" },
                    { label: "Friends", value: "0", icon: "👋" },
                    { label: "Total Paid", value: `₹${stats.totalSplit.toLocaleString()}`, icon: "💰" },
                    { label: "Trust Score", value: "100", icon: "💎" },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] card-shadow border border-slate-50 dark:border-slate-700 text-center space-y-1 group hover:border-primary/20 transition-colors">
                        <span className="text-2xl group-hover:scale-110 transition-transform block">{stat.icon}</span>
                        <p className="text-2xl font-bold font-poppins mt-2">{stat.value}</p>
                        <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Settings List */}
            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] card-shadow border border-slate-100 dark:border-slate-700 overflow-hidden divide-y divide-slate-50 dark:divide-slate-700 mx-1 md:mx-0">
                {[
                    { icon: Bell, label: "Notification Preferences", desc: "Manage alerts and web push", color: "text-primary" },
                    { icon: Shield, label: "Security & Privacy", desc: "Two-factor auth and data privacy", color: "text-success" },
                    { icon: Moon, label: "Appearance", desc: "Dark mode and theme settings", color: "text-indigo-400" },
                    { icon: CreditCard, label: "Payment Methods", desc: "Manage your UPI and bank links", color: "text-amber-500" },
                    { icon: Download, label: "Export Data", desc: "Download expenses as CSV/PDF", color: "text-secondary" },
                ].map((item) => (
                    <button key={item.label} className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                        <div className="flex items-center gap-4 text-left">
                            <div className={`p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl ${item.color}`}>
                                <item.icon size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">{item.label}</p>
                                <p className="text-xs text-foreground/40 font-medium">{item.desc}</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-foreground/20 group-hover:translate-x-1 transition-transform" />
                    </button>
                ))}
            </div>

            {/* Logout */}
            <div className="px-1 md:px-0">
                <button
                    onClick={handleLogout}
                    className="w-full bg-danger/10 text-danger py-5 rounded-[2rem] font-bold flex items-center justify-center gap-2 hover:bg-danger/20 transition-all border border-danger/10"
                >
                    <LogOut size={20} /> Log Out
                </button>
            </div>

            <p className="text-center text-[10px] text-foreground/20 font-black uppercase tracking-[0.4em] py-8">
                SplitSmart v1.0.0
            </p>
        </div>
    );
}

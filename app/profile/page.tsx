"use client";

import { LogOut, Settings, Bell, Shield, Moon, Download, CreditCard, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/components/common/ToastProvider";
import ConfirmDialog from "@/components/common/ConfirmDialog";

export default function ProfilePage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ groups: 0, friends: 0, totalSplit: 0 });
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const [upiId, setUpiId] = useState("");
    const [isEditingUpi, setIsEditingUpi] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);

    useEffect(() => {
        async function getProfile() {
            setLoading(true);
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (authUser) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', authUser.id)
                        .single();

                    const fullName = profile?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0];
                    const firstName = profile?.first_name || authUser.user_metadata?.first_name || fullName?.split(' ')[0];

                    setUser({ ...authUser, ...profile, display_name: fullName, first_name: firstName });
                    setUpiId(profile?.upi_id || "");

                    // Fetch stats safely
                    try {
                        const { data: myGroups } = await supabase.from('group_members').select('group_id').eq('user_id', authUser.id);
                        const myGroupIds = myGroups?.map(g => g.group_id) || [];
                        const { data: expenses } = await supabase.from('expenses').select('amount').eq('paid_by', authUser.id);

                        let friendsCount = 0;
                        if (myGroupIds.length > 0) {
                            const { data: allGroupMembers } = await supabase.from('group_members').select('user_id').in('group_id', myGroupIds);
                            friendsCount = new Set(allGroupMembers?.map(m => m.user_id).filter(id => id !== authUser.id)).size;
                        }

                        setStats({
                            groups: myGroups?.length || 0,
                            friends: friendsCount,
                            totalSplit: expenses?.reduce((acc, curr) => acc + Number(curr.amount || 0), 0) || 0
                        });
                    } catch (statErr) {
                        console.error("Stats fetch error:", statErr);
                    }
                } else {
                    router.push('/auth');
                }
            } catch (err) {
                console.error("Profile init error:", err);
            } finally {
                setLoading(false);
            }
        }
        getProfile();
    }, [router]);

    const exportToCSV = async () => {
        if (!user?.id) {
            showToast("User data not loaded. Please refresh.", "error");
            return;
        }
        setExportLoading(true);
        try {
            const { data: expenses, error } = await supabase
                .from('expenses')
                .select('*, groups(name)')
                .eq('paid_by', user.id);

            if (error) throw error;

            if (!expenses || expenses.length === 0) {
                showToast("No expenses found to export! Add some expenses first.", "info");
                return;
            }

            const headers = ["Date", "Description", "Amount", "Category", "Group"];
            const rows = expenses.map(e => [
                new Date(e.date).toLocaleDateString(),
                `"${(e.description || '').replace(/"/g, '""')}"`,
                e.amount,
                e.category,
                e.groups?.name || 'N/A'
            ]);

            const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SplitSmart_Expenses_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            showToast("Expenses exported successfully!", "success");
        } catch (err: any) {
            console.error("Export error:", err);
            showToast("Export failed: " + err.message, "error");
        } finally {
            setExportLoading(false);
        }
    };

    const saveUpi = async () => {
        if (!user?.id) return;
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ upi_id: upiId })
                .eq('id', user.id);

            if (error) throw error;

            setUser((prev: any) => ({ ...prev, upi_id: upiId }));
            setIsEditingUpi(false);
            showToast("Payment method updated successfully!", "success");
        } catch (err: any) {
            console.error("Save UPI error:", err);
            showToast("Failed to save UPI: " + err.message, "error");
        }
    };

    const handleLogout = async () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="px-2 py-4 md:px-10 md:py-10 space-y-10 pb-32 text-foreground relative z-10">
            <ConfirmDialog
                isOpen={showLogoutConfirm}
                title="Log Out?"
                message="Are you sure you want to log out of your account?"
                confirmText="Log Out"
                cancelText="Cancel"
                type="warning"
                onConfirm={confirmLogout}
                onCancel={() => setShowLogoutConfirm(false)}
            />
            <h1 className="text-3xl font-bold font-poppins text-foreground px-2">Profile Settings</h1>

            {/* User Card */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] card-shadow border border-slate-50 dark:border-slate-700 flex flex-col md:flex-row items-center gap-8 transition-all mx-1 md:mx-0">
                <div className="w-24 h-24 rounded-[2rem] bg-primary/10 p-2 overflow-hidden ring-4 ring-primary/5">
                    <img
                        src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.first_name || 'User'}`}
                        alt="profile"
                        className="w-full h-full rounded-2xl object-cover"
                    />
                </div>
                <div className="flex-grow space-y-2 text-center md:text-left">
                    <h2 className="text-2xl font-bold font-poppins capitalize">{user?.display_name || "Account User"}</h2>
                    <p className="text-foreground/40 font-medium">{user?.email}</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                        <span className="bg-success/10 text-success text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Verified User</span>
                        <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Premium Member</span>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setIsEditingUpi(true);
                        setTimeout(() => {
                            const el = document.getElementById('upi-section');
                            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                    }}
                    className="hidden md:block bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all group border border-transparent hover:border-primary/20"
                    title="Edit Payment Info"
                >
                    <Settings className="text-foreground/40 group-hover:text-primary" />
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-1 md:px-0">
                {[
                    { label: "Groups", value: stats.groups, icon: "👥" },
                    { label: "Friends", value: stats.friends, icon: "👋" },
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

            {/* Feature List */}
            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20 px-4">Account Features</h3>
                <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] card-shadow border border-slate-100 dark:border-slate-700 overflow-hidden divide-y divide-slate-50 dark:divide-slate-700 mx-1 md:mx-0">

                    {/* Notifications */}
                    <button
                        onClick={() => showToast("Notification settings are currently managed automatically.", "info")}
                        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                    >
                        <div className="flex items-center gap-4 text-left">
                            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                                <Bell size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Notification Preferences</p>
                                <p className="text-xs text-foreground/40 font-medium">Smart alerts and mobile push are active</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-foreground/20 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Security */}
                    <button
                        onClick={() => showToast("Your data is secured by Supabase encryption.", "success")}
                        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                    >
                        <div className="flex items-center gap-4 text-left">
                            <div className="p-3 bg-success/10 text-success rounded-2xl">
                                <Shield size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Security & Privacy</p>
                                <p className="text-xs text-foreground/40 font-medium">End-to-end encryption enabled for all bills</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-foreground/20 group-hover:translate-x-1 transition-transform" />
                    </button>

                    {/* Appearance */}
                    <button className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group opacity-80 cursor-default">
                        <div className="flex items-center gap-4 text-left">
                            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
                                <Moon size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Appearance</p>
                                <p className="text-xs text-foreground/40 font-medium capitalize">Always Dark Mode (App Choice)</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-primary px-2 py-1 bg-primary/5 rounded-lg uppercase tracking-widest">Active</span>
                    </button>

                    {/* Payment Methods */}
                    <div id="upi-section" className="p-6 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">UPI ID for Settlements</p>
                                    <p className="text-xs text-foreground/40 font-medium">Used for direct payment links</p>
                                </div>
                            </div>
                            {!isEditingUpi && (
                                <button
                                    onClick={() => setIsEditingUpi(true)}
                                    className="text-primary font-bold text-xs uppercase tracking-widest hover:underline px-4 py-2 bg-primary/5 rounded-lg"
                                >
                                    {upiId ? 'Edit' : 'Add'}
                                </button>
                            )}
                        </div>

                        {isEditingUpi ? (
                            <div className="flex gap-2 animate-in slide-in-from-top-2 duration-300">
                                <input
                                    type="text"
                                    placeholder="yourname@upi"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    autoFocus
                                    className="flex-grow bg-white dark:bg-slate-800 border-2 border-primary/20 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-all shadow-inner"
                                />
                                <button onClick={saveUpi} className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 active:scale-95">Save</button>
                                <button onClick={() => setIsEditingUpi(false)} className="px-4 py-2 text-sm font-bold text-foreground/40">Cancel</button>
                            </div>
                        ) : (
                            <p className="text-sm font-mono text-foreground/60 pl-[68px]">
                                {upiId || "No UPI ID added yet"}
                            </p>
                        )}
                    </div>

                    {/* Export Data */}
                    <button
                        onClick={exportToCSV}
                        disabled={exportLoading}
                        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                    >
                        <div className="flex items-center gap-4 text-left">
                            <div className="p-3 bg-secondary/10 text-secondary rounded-2xl">
                                {exportLoading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                            </div>
                            <div>
                                <p className="font-bold text-sm">Export Data</p>
                                <p className="text-xs text-foreground/40 font-medium">Download all expenses as CSV</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-foreground/20 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Logout */}
            <div className="px-1 md:px-0 pt-4">
                <button
                    onClick={handleLogout}
                    className="w-full bg-danger/10 text-danger py-5 rounded-[2rem] font-bold flex items-center justify-center gap-2 hover:bg-danger/20 transition-all border border-danger/10 active:scale-[0.98]"
                >
                    <LogOut size={20} /> Log Out
                </button>
            </div>

            <p className="text-center text-[10px] text-foreground/20 font-black uppercase tracking-[0.4em] py-8">
                SplitSmart v1.2.0 • Build 2026
            </p>
        </div>
    );
}

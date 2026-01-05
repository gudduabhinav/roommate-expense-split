"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, MoreVertical, Plus, Receipt, TrendingUp, History, Users as UsersIcon, Loader2, Share2, Copy, CheckCircle2, Trash2, UserMinus, ArrowUpRight, ArrowDownLeft, Calendar, Mail, Search, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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

export default function GroupDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("expenses");
    const [group, setGroup] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [userRole, setUserRole] = useState<string>("member");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showInviteOptions, setShowInviteOptions] = useState(false);

    // Manual Add Member States
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [addingUser, setAddingUser] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Group Info
            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .select('*')
                .eq('id', id)
                .single();

            if (groupData) setGroup(groupData);
            if (groupError) console.error("Group Fetch Error:", groupError);

            // Fetch Members
            const { data: membersRaw, error: membersError } = await supabase
                .from('group_members')
                .select('*')
                .eq('group_id', id);

            if (membersError) console.error("Members Fetch Error:", membersError);

            if (membersRaw) {
                // Fetch Profiles specially
                const userIds = membersRaw.map(m => m.user_id);
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('*')
                    .in('id', userIds);

                const mergedMembers = membersRaw.map(m => ({
                    ...m,
                    profiles: profilesData?.find(p => p.id === m.user_id) || null
                }));

                setMembers(mergedMembers);

                const currentUserMember = mergedMembers.find(m => m.user_id === user.id);
                if (currentUserMember) setUserRole(currentUserMember.role);
            }

            // Fetch Expenses
            const { data: expensesData, error: expensesError } = await supabase
                .from('expenses')
                .select('*')
                .eq('group_id', id)
                .order('created_at', { ascending: false });

            if (expensesData) setExpenses(expensesData);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        let mounted = true;
        async function init() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth');
                return;
            }
            if (mounted) await fetchData();
            if (mounted) setLoading(false);
        }
        init();

        // Realtime Subscription
        const channel = supabase
            .channel('group_updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'group_members', filter: `group_id=eq.${id}` },
                () => fetchData()
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'expenses', filter: `group_id=eq.${id}` },
                () => {
                    fetchData();
                    router.refresh();
                }
            )
            .subscribe();

        return () => {
            mounted = false;
            supabase.removeChannel(channel);
        };
    }, [id, router]);

    // Search Users Effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                // Search by email or name
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .or(`full_name.ilike.%${searchQuery}%, email.ilike.%${searchQuery}%`, { foreignTable: "profiles" })
                    // Fallback to searching by full name if email isn't available
                    .ilike('full_name', `%${searchQuery}%`)
                    .limit(5);

                if (data) {
                    // Filter out existing members
                    const existingIds = new Set(members.map(m => m.user_id));
                    setSearchResults(data.filter(u => !existingIds.has(u.id)));
                }
            } catch (error) {
                console.error("Search error", error);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, members]);


    const copyInviteLink = () => {
        if (!group?.invite_code) return;
        const link = `${window.location.origin}/join/${group.invite_code}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (!group?.invite_code) return;
        const link = `${window.location.origin}/join/${group.invite_code}`;
        const text = `Join my expense circle "${group.name}" on Roomie! tap here: ${link}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Join ${group.name}`,
                    text: text,
                    url: link
                });
            } catch (err) {
                console.log("Share skipped", err);
            }
        } else {
            window.location.href = `mailto:?subject=Join ${group.name}&body=${text}`;
        }
    };

    const handleDeleteGroup = async () => {
        if (userRole !== 'owner') return;
        if (!confirm("Are you sure? This will delete all expenses and members forever.")) return;

        try {
            const { error } = await supabase.from('groups').delete().eq('id', id);
            if (error) throw error;
            router.push('/groups');
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleRemoveMember = async (memberUserId: string) => {
        if (userRole !== 'owner') return;
        if (!confirm("Remove this member from the circle?")) return;

        try {
            const { error } = await supabase
                .from('group_members')
                .delete()
                .eq('group_id', id)
                .eq('user_id', memberUserId);

            if (error) throw error;
            setMembers(members.filter(m => m.user_id !== memberUserId));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleAddMember = async (userId: string) => {
        setAddingUser(userId);
        try {
            const { error } = await supabase
                .from('group_members')
                .insert([{
                    group_id: id,
                    user_id: userId,
                    role: 'member'
                }]);

            if (error) throw error;

            // Success
            setSearchQuery("");
            setSearchResults([]);
            setIsAddMemberOpen(false);
            fetchData(); // Refresh list immediately
        } catch (error: any) {
            alert("Failed to add member: " + error.message);
        } finally {
            setAddingUser(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (!group) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-6 text-foreground">
                <h1 className="text-2xl font-bold font-poppins">Circle not found</h1>
                <p className="text-foreground/40 text-sm">You might not have access or it has been deleted.</p>
                <Link href="/groups" className="text-primary font-bold hover:underline">Return to Groups</Link>
            </div>
        );
    }

    const isOwner = userRole === 'owner';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-32 text-foreground relative">

            {/* Add Member Modal */}
            {isAddMemberOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold font-poppins">Add New User</h2>
                            <button onClick={() => setIsAddMemberOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-4 pl-12 pr-4 font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {isSearching && (
                                    <div className="flex justify-center py-4">
                                        <Loader2 className="animate-spin text-primary" />
                                    </div>
                                )}

                                {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                                    <p className="text-center text-foreground/40 text-sm py-4">No users found.</p>
                                )}

                                {searchResults.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => handleAddMember(user.id)}
                                        disabled={addingUser === user.id}
                                        className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-left group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                                            <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.first_name}`} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-bold text-sm text-slate-900 dark:text-white">{user.full_name || 'User'}</p>
                                        </div>
                                        {addingUser === user.id ? (
                                            <Loader2 size={16} className="animate-spin text-primary" />
                                        ) : (
                                            <Plus size={20} className="text-foreground/20 group-hover:text-primary transition-colors" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-xs text-center text-foreground/30">User must have an account on Roomie to be added.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header section */}
            <div className="bg-gradient-to-br from-primary to-secondary p-4 md:p-12 pb-24 text-white relative h-80 md:h-72 shadow-2xl">
                <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                {/* Top Bar with High Z-Index to overlap Balance Card if dropdown opens */}
                <div className="max-w-5xl mx-auto flex justify-between items-start relative z-50 pt-4 md:pt-0">
                    <Link href="/dashboard" className="bg-white/20 p-2 rounded-xl backdrop-blur-md hover:bg-white/30 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex gap-2">
                        {/* Invite Button Group */}
                        <div className="relative">
                            <button onClick={() => setShowInviteOptions(!showInviteOptions)} className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md hover:bg-white/30 transition-all flex items-center gap-2 font-bold text-[10px] md:text-xs uppercase tracking-widest">
                                <Plus size={16} /> Invite
                            </button>

                            {/* Dropdown for Invite Options */}
                            {showInviteOptions && (
                                <div className="absolute top-12 right-0 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-2 text-foreground z-[100] animate-in fade-in slide-in-from-top-2">
                                    <button onClick={copyInviteLink} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl flex items-center gap-3 w-full text-left transition-colors">
                                        {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">Copy Link</span>
                                    </button>
                                    <button onClick={handleShare} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl flex items-center gap-3 w-full text-left transition-colors">
                                        <Share2 size={16} />
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">Share via...</span>
                                    </button>
                                    <a href={`mailto:?subject=Join ${group.name}&body=Join my circle using code: ${group.invite_code}`} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl flex items-center gap-3 w-full text-left transition-colors">
                                        <Mail size={16} />
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">Email Invite</span>
                                    </a>
                                </div>
                            )}
                        </div>

                        {isOwner && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="bg-white/20 p-2 rounded-xl backdrop-blur-md hover:bg-white/30 transition-colors"
                                >
                                    <MoreVertical size={20} />
                                </button>

                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                                        <button
                                            onClick={handleDeleteGroup}
                                            className="w-full flex items-center gap-2 px-4 py-3 text-danger hover:bg-danger/5 rounded-xl transition-colors font-bold text-sm"
                                        >
                                            <Trash2 size={16} /> Delete Circle
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section (Lower Z-Index than Top Bar) */}
                <div className="max-w-5xl mx-auto mt-6 md:mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 px-2 md:px-0">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">
                                {group.category}
                            </span>
                            <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] font-mono">CODE: {group.invite_code}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold font-poppins tracking-tight">{group.name}</h1>
                        <div className="flex items-center gap-3">
                            <div className="flex -space-x-3">
                                {members.slice(0, 5).map((m, i) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-primary bg-slate-200 overflow-hidden text-slate-900">
                                        <img src={m.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.profiles?.first_name || 'User'}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                {members.length > 5 && (
                                    <div className="w-8 h-8 rounded-full border-2 border-primary bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                                        +{members.length - 5}
                                    </div>
                                )}
                            </div>
                            <p className="text-white/70 flex items-center gap-2 font-medium text-sm">
                                {members.length} Members • {isOwner ? 'Circle Owner' : 'Member'}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-[2.5rem] p-6 md:p-8 border border-white/20 shadow-2xl">
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Circle Net Balance</p>
                        <p className="text-3xl md:text-4xl font-bold font-poppins">₹{(group.total || 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-2 md:px-4 -mt-8 space-y-10 relative z-10">
                {/* Members list & Add Button */}
                <div className="flex gap-4 overflow-x-auto pb-4 px-1 hide-scrollbar">
                    {members.map((member) => (
                        <div key={member.id} className="relative group shrink-0">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] card-shadow border border-slate-100 dark:border-slate-700 w-48 md:w-52 space-y-4 hover:border-primary/40 transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden ring-4 ring-slate-50 dark:ring-slate-700 shadow-lg relative">
                                        <img src={member.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.profiles?.first_name || 'User'}`} alt="avatar" />
                                    </div>
                                    <div className={`text-[10px] font-black px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-foreground/30 uppercase tracking-[0.1em]`}>
                                        {member.role === 'owner' ? 'Admin' : 'Active'}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm truncate font-poppins">{member.profiles?.full_name || 'Member'}</h3>
                                    <p className={`font-black font-poppins text-lg text-foreground/10 uppercase`}>₹0</p>
                                </div>
                            </div>

                            {isOwner && member.role !== 'owner' && (
                                <button
                                    onClick={() => handleRemoveMember(member.user_id)}
                                    className="absolute -top-2 -right-2 w-8 h-8 bg-danger text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:scale-110"
                                >
                                    <UserMinus size={16} />
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Add Member Button (Replaces the specific Invite Card) */}
                    <button onClick={() => setIsAddMemberOpen(true)} className="shrink-0 w-48 md:w-52 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-foreground/30 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all group">
                        <div className="p-4 rounded-full border-2 border-current group-hover:scale-110 transition-transform">
                            <UserPlus size={32} />
                        </div>
                        <div className="text-center">
                            <span className="font-black text-[10px] uppercase tracking-widest block">Add Member</span>
                            <span className="text-[10px] opacity-50 block mt-1">Select from users</span>
                        </div>
                    </button>
                </div>

                {/* Sub-Tabs */}
                <div className="bg-white/80 dark:bg-slate-800/80 p-1.5 rounded-[2.5rem] card-shadow border border-slate-100 dark:border-slate-700 flex backdrop-blur-2xl mx-1 overflow-x-auto hide-scrollbar">
                    {[
                        { id: "expenses", label: "Ledger", icon: Receipt },
                        { id: "balances", label: "Balances", icon: UsersIcon },
                        { id: "analytics", label: "Stats", icon: TrendingUp },
                        { id: "activity", label: "Log", icon: History },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-grow min-w-[80px] flex items-center justify-center gap-2 py-4 md:py-5 px-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-xl shadow-primary/30' : 'text-foreground/30'}`}
                            >
                                <Icon size={18} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="px-1 space-y-6 pb-20">
                    {activeTab === "expenses" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center px-4 md:px-6">
                                <h2 className="text-2xl font-bold font-poppins text-slate-900 dark:text-white">Group Ledger</h2>
                                <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.2em]">{expenses.length} Records</p>
                            </div>

                            {expenses.length === 0 ? (
                                <div className="py-24 bg-white/40 dark:bg-slate-800/40 rounded-[3.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-6 backdrop-blur-sm">
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-foreground/10 rotate-3">
                                        <Receipt size={40} />
                                    </div>
                                    <Link href="/add-expense" className="bg-primary text-white px-10 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/30">
                                        Add Expense
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {expenses.map((expense) => (
                                        <div key={expense.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] card-shadow border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-primary/40 transition-all cursor-pointer">
                                            <div className="flex items-center gap-4 md:gap-5">
                                                <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-inner">
                                                    {expense.category_icon || (CATEGORIES.find(c => c.id === expense.category)?.icon) || '💸'}
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-bold font-poppins text-base md:text-lg text-slate-900 dark:text-white">{expense.description}</h3>
                                                    <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                                        <Calendar size={10} /> {new Date(expense.date || expense.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl md:text-2xl font-bold font-poppins text-primary">₹{(expense.amount || 0).toLocaleString()}</p>
                                                <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest">Shared</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "balances" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-2xl font-bold font-poppins px-4">Balances</h2>
                            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 text-center space-y-4">
                                <UsersIcon size={48} className="mx-auto text-primary/20" />
                                <p className="text-foreground/40 font-medium">Coming Soon: Detailed settlement logic and balance tracking for individual members.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === "analytics" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-2xl font-bold font-poppins px-4">Visual Stats</h2>
                            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="flex gap-4 items-end h-40">
                                    {[40, 70, 45, 90, 60, 80].map((h, i) => (
                                        <div key={i} style={{ height: `${h}%` }} className="w-8 bg-primary/20 rounded-t-lg" />
                                    ))}
                                </div>
                                <p className="text-foreground/40 font-medium pt-4">Spending charts and category-wise analysis are being prepared.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === "activity" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 text-center py-12">
                            <History size={48} className="mx-auto text-foreground/10" />
                            <p className="text-foreground/40 font-black text-[10px] uppercase tracking-[0.4em]">Audit Log</p>
                            <p className="text-xs text-foreground/30">History of all edits and removals will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

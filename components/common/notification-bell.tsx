"use client";

import { useState, useEffect } from "react";
import { Bell, BellDot, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        async function fetchNotifications() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (data) {
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);
            }

            // Real-time listener
            const channel = supabase
                .channel('schema-db-changes')
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
                    (payload) => {
                        setNotifications(prev => [payload.new, ...prev].slice(0, 10));
                        setUnreadCount(count => count + 1);
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }

        fetchNotifications();
    }, []);

    const markAllRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id);

        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-3 bg-white dark:bg-slate-800 rounded-2xl card-shadow border border-slate-50 dark:border-slate-700 hover:scale-105 transition-transform"
            >
                {unreadCount > 0 ? (
                    <BellDot className="text-primary animate-pulse" size={24} />
                ) : (
                    <Bell className="text-foreground/40" size={24} />
                )}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-lg">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute right-0 mt-4 w-80 bg-white dark:bg-slate-900 rounded-[2rem] card-shadow border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-bold font-poppins text-sm">Notifications</h3>
                            <button
                                onClick={markAllRead}
                                className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                            >
                                Mark all read
                            </button>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-10 text-center space-y-2">
                                    <Bell className="mx-auto text-foreground/10" size={32} />
                                    <p className="text-xs text-foreground/40 font-medium">No new alerts for you.</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-5 border-b border-slate-50 dark:border-slate-800/50 flex gap-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30 ${!notification.is_read ? 'bg-primary/[0.02]' : ''}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notification.type === 'expense' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 'bg-primary/10 text-primary'}`}>
                                            {notification.type === 'expense' ? '💸' : '✨'}
                                        </div>
                                        <div className="space-y-1 overflow-hidden">
                                            <p className="font-bold text-xs truncate text-slate-900 dark:text-white">{notification.title}</p>
                                            <p className="text-xs text-foreground/40 leading-relaxed">{notification.message}</p>
                                            <p className="text-[8px] font-black uppercase text-foreground/20 tracking-widest pt-1">
                                                {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {!notification.is_read && (
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

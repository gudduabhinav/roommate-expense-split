"use client";

import { useState, useEffect } from "react";
import { Bell, ShieldCheck, X, Loader2 } from "lucide-react";
import { notificationService } from "@/lib/notifications/service";

export function PushPermissionPrompt() {
    const [status, setStatus] = useState<"default" | "granted" | "denied" | "loading">("loading");
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if ("Notification" in window) {
            setStatus(Notification.permission as any);
            if (Notification.permission === "default") {
                setIsVisible(true);
            }
        }
    }, []);

    const handleSubscribe = async () => {
        setStatus("loading");
        const granted = await notificationService.requestPermission();
        if (granted) {
            await notificationService.initialize();
            await notificationService.subscribeToPush();
            setStatus("granted");
            setTimeout(() => setIsVisible(false), 2000);
        } else {
            setStatus("denied");
        }
    };

    if (!isVisible || status === "granted") return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 z-[100] animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary" />

                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <X size={16} className="text-foreground/30" />
                </button>

                <div className="flex gap-4 items-start pr-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                        <Bell size={24} className="animate-bounce" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold font-poppins text-slate-900 dark:text-white">Enable Push Updates</h3>
                        <p className="text-xs text-foreground/50 leading-relaxed">
                            Get instant alerts on your phone when roommates add bills or settle up. Don't miss a single split!
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={handleSubscribe}
                        disabled={status === "loading"}
                        className="flex-grow bg-primary text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : (
                            <>
                                <ShieldCheck size={16} /> Activate Now
                            </>
                        )}
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="px-6 py-3 rounded-xl border border-slate-100 dark:border-slate-800 text-foreground/40 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                        Later
                    </button>
                </div>
            </div>
        </div>
    );
}

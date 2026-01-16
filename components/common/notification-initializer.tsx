"use client";

import { useEffect } from "react";
import { notificationService } from "@/lib/notifications/service";
import { supabase } from "@/lib/supabase/client";

export function NotificationInitializer() {
    useEffect(() => {
        let isSubscribed = true;

        async function init() {
            // Wait for auth to be ready
            const { data: { session } } = await supabase.auth.getSession();

            if (session && isSubscribed) {
                // User is logged in, initialize notifications
                try {
                    await notificationService.initialize();

                    // Request permission and subscribe to push
                    const hasPermission = await notificationService.requestPermission();
                    if (hasPermission) {
                        await notificationService.subscribeToPush();
                        console.log("✅ Push notifications enabled");
                    } else {
                        console.log("⚠️ Push notification permission denied");
                    }
                } catch (error) {
                    console.error("❌ Notification initialization failed:", error);
                }
            }
        }

        init();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session && isSubscribed) {
                try {
                    await notificationService.initialize();
                    const hasPermission = await notificationService.requestPermission();
                    if (hasPermission) {
                        await notificationService.subscribeToPush();
                    }
                } catch (error) {
                    console.error("Notification setup error:", error);
                }
            }
        });

        return () => {
            isSubscribed = false;
            subscription.unsubscribe();
        };
    }, []);

    return null;
}

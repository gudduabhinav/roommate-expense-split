"use client";

import { useEffect } from "react";
import { notificationService } from "@/lib/notifications/service";

export function PWARegistration() {
    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            "serviceWorker" in navigator
        ) {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register("/sw.js")
                    .then((reg) => {
                        console.log("Service Worker registered");
                        // Initialize notifications
                        notificationService.initialize();
                        notificationService.subscribeToPush();
                    })
                    .catch((err) => console.log("Service Worker registration failed", err));
            });
        }
    }, []);

    return null;
}
"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: "danger" | "warning" | "info";
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    type = "warning"
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const colors = {
        danger: "bg-danger text-white hover:bg-danger/90",
        warning: "bg-amber-500 text-white hover:bg-amber-600",
        info: "bg-primary text-white hover:bg-primary/90"
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-2xl ${type === 'danger' ? 'bg-danger/10 text-danger' : type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                            <AlertTriangle size={24} />
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-xl font-bold font-poppins text-slate-900 dark:text-white">{title}</h3>
                            <p className="text-foreground/60 text-sm mt-2">{message}</p>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            <X size={20} className="text-foreground/40" />
                        </button>
                    </div>
                </div>
                <div className="flex gap-3 p-6 pt-0">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 px-4 rounded-2xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3 px-4 rounded-2xl font-bold transition-all shadow-lg ${colors[type]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

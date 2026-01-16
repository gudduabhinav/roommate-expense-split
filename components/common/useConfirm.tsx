"use client";

import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";

export function useConfirm() {
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type?: "danger" | "warning" | "info";
    }>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => {},
        type: "warning"
    });

    const confirm = (title: string, message: string, type: "danger" | "warning" | "info" = "warning"): Promise<boolean> => {
        return new Promise((resolve) => {
            setConfirmState({
                isOpen: true,
                title,
                message,
                type,
                onConfirm: () => {
                    setConfirmState(prev => ({ ...prev, isOpen: false }));
                    resolve(true);
                }
            });
        });
    };

    const ConfirmDialogComponent = () => (
        <ConfirmDialog
            isOpen={confirmState.isOpen}
            title={confirmState.title}
            message={confirmState.message}
            type={confirmState.type}
            onConfirm={confirmState.onConfirm}
            onCancel={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        />
    );

    return { confirm, ConfirmDialogComponent };
}

"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { AlertCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
    confirmText?: string;
    cancelText?: string;
    variant?: "destructive" | "default";
    isLoading?: boolean;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmText = "Confirmer",
    cancelText = "Annuler",
    variant = "destructive",
    isLoading = false
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-[32px] max-w-md p-8">
                <DialogHeader>
                    <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                        variant === "destructive" ? "bg-red-50 dark:bg-red-950/30 text-red-500" : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500"
                    )}>
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <DialogTitle className="text-2xl font-black tracking-tighter">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="font-medium text-zinc-500 pt-1">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 mt-4">
                    <Button
                        variant="ghost"
                        className="rounded-2xl font-bold h-12 px-6"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === "destructive" ? "destructive" : "default"}
                        className={cn(
                            "rounded-2xl font-black h-12 px-8 shadow-lg transition-all active:scale-95",
                            variant === "destructive" ? "shadow-red-500/20" : "bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 shadow-zinc-200"
                        )}
                        onClick={async () => {
                            await onConfirm();
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? "Chargement..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

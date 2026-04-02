"use client";

import React from "react";
import { MessageSquarePlus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";

const FeedbackDialog = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                    Feedback
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black">Votre avis nous intéresse</DialogTitle>
                    <DialogDescription>
                        Une suggestion, un bug ou simplement envie de nous dire bonjour ?
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <textarea
                        className="min-h-[120px] rounded-2xl border-zinc-200 focus-visible:ring-emerald-500 p-4 text-sm"
                        placeholder="Dites-nous tout..."
                    />
                    <Button className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-11 font-bold">
                        Envoyer mon feedback
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default FeedbackDialog;

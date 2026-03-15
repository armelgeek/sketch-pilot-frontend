"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Image } from "lucide-react";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";
import { GenerationVariant } from "@/src/app/character-models/api/character-models-service";
import { cn } from "@/src/lib/utils";

interface GenerationVariantGalleryProps {
    variants?: GenerationVariant[];
    onSelectVariant?: (variant: GenerationVariant) => void;
}

export function GenerationVariantGallery({
    variants = [],
    onSelectVariant,
}: GenerationVariantGalleryProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!variants || variants.length === 0) {
        return null;
    }

    const maxVisibleVariants = 3;
    const displayedVariants = variants.slice(0, maxVisibleVariants);
    const hasMoreVariants = variants.length > maxVisibleVariants;

    return (
        <Card className="p-4 bg-linear-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 border border-indigo-200 dark:border-indigo-800/50">
            <div
                className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="font-bold text-sm text-indigo-900 dark:text-indigo-100">
                        Galerie de Variantes
                    </h3>
                    <Badge variant="secondary" className="bg-indigo-200 dark:bg-indigo-800/50 text-indigo-800 dark:text-indigo-200">
                        {variants.length}
                    </Badge>
                </div>
                {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-indigo-600" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-indigo-600" />
                )}
            </div>

            {/* Gallery Grid */}
            <div className={cn(
                "mt-4 grid gap-3 transition-all duration-300",
                isExpanded ? "grid-cols-4 md:grid-cols-5" : "grid-cols-3"
            )}>
                {displayedVariants.map((variant, idx) => (
                    <div
                        key={variant.id}
                        onClick={() => onSelectVariant?.(variant)}
                        className="relative group cursor-pointer"
                    >
                        <Avatar className="h-16 w-16 border-2 border-indigo-300 dark:border-indigo-700 group-hover:border-indigo-500 transition-all shadow-md group-hover:shadow-lg group-hover:scale-105">
                            <AvatarImage src={variant.imageUrl} className="object-cover" />
                            <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900">
                                <Image className="h-4 w-4" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border border-white dark:border-zinc-900">
                            {idx + 1}
                        </div>
                        {variant.seedUsed !== undefined && (
                            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-[8px] rounded px-1 py-0.5 font-mono whitespace-nowrap">
                                {variant.seedUsed}
                            </div>
                        )}
                    </div>
                ))}

                {isExpanded && hasMoreVariants && variants.slice(maxVisibleVariants).map((variant, idx) => (
                    <div
                        key={variant.id}
                        onClick={() => onSelectVariant?.(variant)}
                        className="relative group cursor-pointer"
                    >
                        <Avatar className="h-16 w-16 border-2 border-indigo-300 dark:border-indigo-700 group-hover:border-indigo-500 transition-all shadow-md group-hover:shadow-lg group-hover:scale-105">
                            <AvatarImage src={variant.imageUrl} className="object-cover" />
                            <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900">
                                <Image className="h-4 w-4" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border border-white dark:border-zinc-900">
                            {idx + maxVisibleVariants + 1}
                        </div>
                    </div>
                ))}
            </div>

            {isExpanded && (
                <div className="mt-4 space-y-2 text-xs text-indigo-600 dark:text-indigo-300">
                    <p>📌 <strong>Cliquez sur une variante</strong> pour la restaurer comme image principale.</p>
                    <p>🔐 Chaque variante garde son seed pour une reproduction exacte.</p>
                </div>
            )}
        </Card>
    );
}

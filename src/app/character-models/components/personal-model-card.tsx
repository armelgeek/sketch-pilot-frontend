"use client";

import { MoreVertical, Edit2, Trash2, Tag, Lock } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { CharacterModel } from "@/src/app/character-models/api/character-models-service";
import { GenerationVariantGallery } from "./generation-variant-gallery";

interface PersonalModelCardProps {
    model: CharacterModel;
    onEdit?: (model: CharacterModel) => void;
    onDelete?: (modelId: string) => void;
}

export function PersonalModelCard({
    model,
    onEdit,
    onDelete,
}: PersonalModelCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 glass-pill border border-emerald-500/10">
            <div className="p-4 space-y-4">
                {/* Header with Avatar and Actions */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 flex gap-3">
                        <Avatar className="h-16 w-16 border-2 border-emerald-500/20 shadow-md">
                            <AvatarImage src={model.imageUrl} className="object-cover" />
                            <AvatarFallback className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 font-black text-lg">
                                {model.name[0]}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <h3 className="font-black text-lg tracking-tight text-zinc-800 dark:text-zinc-100 truncate">
                                {model.name}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                {model.description}
                            </p>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem onClick={() => onEdit?.(model)} className="cursor-pointer">
                                <Edit2 className="h-4 w-4 mr-2" />
                                Éditer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete?.(model.id)}
                                className="cursor-pointer text-red-600 dark:text-red-400"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Advanced Features Indicators */}
                <div className="flex flex-wrap gap-2">
                    {model.lockedPromptSegment && (
                        <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Cohérence Activée
                        </Badge>
                    )}

                    {model.voiceId && (
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                            🎙️ Voix Assignée
                        </Badge>
                    )}

                    {model.advancedSeed && (
                        <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                            Seed: {model.advancedSeed}
                        </Badge>
                    )}
                </div>

                {/* Tags */}
                {model.tags && model.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {model.tags.slice(0, 5).map(tag => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-100 text-[10px]"
                            >
                                <Tag className="h-2.5 w-2.5 mr-1" />
                                {tag}
                            </Badge>
                        ))}
                        {model.tags.length > 5 && (
                            <Badge variant="secondary" className="text-[10px]">
                                +{model.tags.length - 5}
                            </Badge>
                        )}
                    </div>
                )}

                {/* Generation Variants */}
                {model.generationHistory && model.generationHistory.length > 0 && (
                    <GenerationVariantGallery
                        variants={model.generationHistory}
                    />
                )}

                {/* Metadata */}
                <div className="flex justify-between items-center text-[10px] text-zinc-400 dark:text-zinc-500 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                    <span>ID: {model.id.slice(0, 8)}</span>
                    {model.updatedAt && (
                        <span>Mis à jour: {new Date(model.updatedAt).toLocaleDateString('fr-FR')}</span>
                    )}
                </div>
            </div>
        </Card>
    );
}

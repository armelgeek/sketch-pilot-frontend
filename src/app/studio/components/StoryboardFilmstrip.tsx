"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { ChevronLeft, ChevronRight, Film, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useStudioStore } from "../store";
import { videosService } from "@/src/services/videos-service";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface StoryboardFilmstripProps {
    vertical?: boolean;
}

function SortableSceneItem({ scene, index, vertical }: { scene: any; index: number; vertical?: boolean }) {
    const { selectedSceneId, setSelectedSceneId } = useStudioStore();
    const sId = scene.id || `s${index + 1}`;
    const isAct = selectedSceneId === sId;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: sId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
        opacity: isDragging ? 0.7 : 1,
    };

    if (vertical) {
        return (
            <button
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                onClick={() => setSelectedSceneId(sId)}
                className={cn(
                    "relative w-full aspect-video shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                    isAct
                        ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-[1.02] z-10"
                        : "border-zinc-100 hover:border-zinc-300 hover:scale-[1.01]"
                )}>
                {scene.thumbnailUrl || scene.imageUrl ? (
                    <img
                        src={scene.thumbnailUrl || scene.imageUrl}
                        alt={`Aperçu ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 group-hover:bg-zinc-100 transition-colors pointer-events-none">
                        <Film className="h-4 w-4 text-zinc-200 group-hover:text-zinc-300 transition-colors" />
                    </div>
                )}
                <div className={cn(
                    "absolute bottom-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm transition-colors",
                    isAct ? "bg-emerald-500 text-white" : "bg-black/60 text-white group-hover:bg-black/80"
                )}>
                    {String(index + 1).padStart(2, "0")}
                </div>
                {scene.imageUrl && (
                    <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
                )}
            </button>
        );
    }

    return (
        <button
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => setSelectedSceneId(sId)}
            className={cn(
                "relative w-[200px] shrink-0 flex flex-col gap-1 rounded-md overflow-hidden border-2 transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500",
                isAct
                    ? "border-emerald-500 shadow-sm shadow-emerald-200/60"
                    : "border-zinc-200/80 hover:border-zinc-300"
            )}>
            <div className="relative w-full bg-zinc-100 rounded-md overflow-hidden" style={{ aspectRatio: "16/9" }}>
                {scene.thumbnailUrl || scene.imageUrl ? (
                    <img
                        src={scene.thumbnailUrl || scene.imageUrl}
                        alt={`Aperçu scène ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 pointer-events-none" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <Film className="h-4 w-4 text-zinc-300" />
                    </div>
                )}
                <div className={cn(
                    "absolute bottom-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors",
                    isAct ? "bg-emerald-500 text-white" : "bg-black/50 text-white"
                )}>
                    {String(index + 1).padStart(2, "0")}
                </div>
                {scene.imageUrl && (
                    <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm" />
                )}
            </div>
        </button>
    );
}

export function StoryboardFilmstrip({ vertical }: StoryboardFilmstripProps) {
    const {
        activeVideo,
        setVideo,
        selectedSceneId,
    } = useStudioStore();

    const filmstripRef = useRef<HTMLDivElement | null>(null);

    const displayScenes = (activeVideo?.scenes?.length ? activeVideo.scenes : activeVideo?.script?.scenes) || [];

    // Create definitive array with proper id string tracking
    const items = displayScenes.map((scene: any, i: number) => ({
        ...scene,
        id: scene.id || `s${i + 1}`
    }));

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((i: any) => i.id === active.id);
            const newIndex = items.findIndex((i: any) => i.id === over.id);

            const newOrder = arrayMove(items, oldIndex, newIndex);

            if (activeVideo) {
                const updatedVideo = {
                    ...activeVideo,
                    scenes: newOrder,
                    script: activeVideo.script ? { ...activeVideo.script, scenes: newOrder } : undefined
                };

                // Optimistic UI Update
                setVideo(updatedVideo as any);

                // Persist to backend without blocking UI
                videosService.update(activeVideo.id, {
                    scenes: newOrder,
                    script: updatedVideo.script
                }).catch(() => {
                    console.error("Failed to persist scene order");
                });
            }
        }
    };

    useEffect(() => {
        if (!filmstripRef.current) return;
        const el = filmstripRef.current.querySelector("[data-active='true']") as HTMLElement | null;
        if (vertical) {
            el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
            el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
    }, [selectedSceneId, vertical]);

    if (vertical) {
        return (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div ref={filmstripRef} className="flex flex-col gap-3 py-1 pb-4">
                    <SortableContext
                        items={items.map((i: any) => i.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {items.map((scene: any, i: number) => (
                            <SortableSceneItem key={scene.id} scene={scene} index={i} vertical />
                        ))}
                    </SortableContext>
                </div>
            </DndContext>
        );
    }

    return (
        <div className="mx-4 border border-zinc-200/80 rounded-xl overflow-hidden flex flex-col bg-white">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <div
                    ref={filmstripRef}
                    className="flex gap-2 overflow-x-auto px-3 py-2 scroll-smooth"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    <SortableContext
                        items={items.map((i: any) => i.id)}
                        strategy={horizontalListSortingStrategy}
                    >
                        {items.map((scene: any, i: number) => (
                            <SortableSceneItem key={scene.id} scene={scene} index={i} />
                        ))}
                    </SortableContext>
                </div>
            </DndContext>
        </div>
    );
}

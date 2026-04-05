"use client";

import { useState, useEffect } from "react";
import { useAdminActions } from "@/src/app/admin";
import {
    Mic2,
    Music,
    Plus,
    Trash2,
    Edit3,
    Volume2,
    Play,
    Pause,
    Tags,
    ChevronRight,
    Search
} from "lucide-react";
import { ConfirmDialog } from "@/src/components/organisms/confirm-dialog";
import {
    Card,
    CardContent,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useAdminVoices, useAdminMusic } from "@/src/app/admin/hooks/use-admin-data";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/src/lib/utils";

export default function AdminAssetsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get("tab") || "voices";

    const { deleteVoice, deleteMusic, isPending } = useAdminActions();

    const [activeTab, setActiveTab] = useState(initialTab);
    const [search, setSearch] = useState("");

    const voicesQuery = useAdminVoices();
    const musicQuery = useAdminMusic();

    // Deletion states
    const [voiceToDelete, setVoiceToDelete] = useState<any>(null);
    const [musicToDelete, setMusicToDelete] = useState<any>(null);

    const [audioPreview, setAudioPreview] = useState<string | null>(null);
    const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const handlePlayPreview = (url: string) => {
        if (previewAudio) {
            previewAudio.pause();
            if (audioPreview === url) {
                setPreviewAudio(null);
                setAudioPreview(null);
                return;
            }
        }
        const audio = new Audio(url);
        audio.play();
        setPreviewAudio(audio);
        setAudioPreview(url);
        audio.onended = () => {
            setPreviewAudio(null);
            setAudioPreview(null);
        };
    };

    const handleCreate = () => {
        if (activeTab === "voices") {
            router.push("/admin/assets/voices/new");
        } else {
            router.push("/admin/assets/music/new");
        }
    };

    const filteredVoices = voicesQuery.data?.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.provider.toLowerCase().includes(search.toLowerCase())
    ) || [];

    const filteredMusic = musicQuery.data?.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    ) || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white">Bibliothèque d'Assets</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Gérez vos presets de voix et vos pistes musicales pour les vidéos.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-amber-500 transition-colors" />
                        <Input
                            placeholder="Rechercher..."
                            className="pl-11 h-12 w-full md:w-[280px] rounded-[20px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm focus:ring-amber-500/20 font-bold transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        className="bg-black hover:bg-zinc-800 text-white rounded-[20px] font-black gap-2 h-12 px-6 shadow-xl"
                        onClick={handleCreate}
                    >
                        <Plus className="h-5 w-5" />
                        Nouveau
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => {
                setActiveTab(v);
                router.push(`/admin/assets?tab=${v}`);
            }} className="w-full">
                <TabsList className="bg-zinc-100 dark:bg-zinc-900/50 p-1.5 rounded-[24px] border border-zinc-200 dark:border-zinc-800 mb-8">
                    <TabsTrigger value="voices" className="rounded-[18px] font-black px-8 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-lg data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white uppercase text-xs tracking-widest transition-all">
                        <Mic2 className="h-4 w-4 mr-2" />
                        Presets de Voix
                    </TabsTrigger>
                    <TabsTrigger value="music" className="rounded-[18px] font-black px-8 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-lg data-[state=active]:text-zinc-900 dark:data-[state=active]:text-white uppercase text-xs tracking-widest transition-all">
                        <Music className="h-4 w-4 mr-2" />
                        Pistes Musicales
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="voices" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {voicesQuery.isLoading ? (
                            Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-[32px]" />)
                        ) : filteredVoices.map((voice) => (
                            <Card key={voice.id} className="border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden group hover:ring-2 ring-amber-500 transition-all duration-300">
                                <CardContent className="p-8">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-amber-50 dark:bg-amber-950/20 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-100 dark:border-amber-900/30">
                                                <Volume2 className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-lg tracking-tight line-clamp-1">{voice.name}</h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase px-2 py-0 border-zinc-200 dark:border-zinc-800 text-zinc-400">
                                                        {voice.provider}
                                                    </Badge>
                                                    {!voice.isActive && (
                                                        <Badge variant="destructive" className="text-[9px] font-black uppercase px-2 py-0">Inactif</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-10 w-10 rounded-full transition-all",
                                                audioPreview === voice.previewUrl ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-zinc-50 dark:bg-zinc-800"
                                            )}
                                            onClick={() => voice.previewUrl && handlePlayPreview(voice.previewUrl)}
                                        >
                                            {audioPreview === voice.previewUrl ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                                        </Button>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
                                            <span className="uppercase tracking-widest font-black text-zinc-300">Langue</span>
                                            <span className="font-bold text-zinc-900 dark:text-zinc-300 uppercase">{voice.language}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
                                            <span className="uppercase tracking-widest font-black text-zinc-300">Genre</span>
                                            <span className="font-bold text-zinc-900 dark:text-zinc-300 uppercase">{voice.gender}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-xl font-black text-xs gap-2 px-4 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                            onClick={() => router.push(`/admin/assets/voices/${voice.id}`)}
                                        >
                                            <Edit3 className="h-4 w-4" /> Éditer
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                                            onClick={() => setVoiceToDelete(voice)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {!voicesQuery.isLoading && filteredVoices.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 rounded-[40px] border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                            <Mic2 className="h-12 w-12 text-zinc-200 mb-4" />
                            <p className="text-zinc-500 font-bold">Aucun preset de voix trouvé.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="music" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {musicQuery.isLoading ? (
                            Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-[32px]" />)
                        ) : filteredMusic.map((track) => (
                            <Card key={track.id} className="border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden group hover:ring-2 ring-indigo-500 transition-all duration-300">
                                <CardContent className="p-8">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 dark:border-indigo-900/30">
                                                <Music className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-lg tracking-tight line-clamp-1">{track.name}</h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase px-2 py-0 border-zinc-200 dark:border-zinc-800 text-zinc-400">
                                                        {track.trackId}
                                                    </Badge>
                                                    {!track.isActive && (
                                                        <Badge variant="destructive" className="text-[9px] font-black uppercase px-2 py-0">Inactif</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-10 w-10 rounded-full transition-all",
                                                audioPreview === track.path ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "bg-zinc-50 dark:bg-zinc-800"
                                            )}
                                            onClick={() => track.path && handlePlayPreview(track.path)}
                                        >
                                            {audioPreview === track.path ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
                                        </Button>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mb-6 min-h-[50px]">
                                        {track.tags?.map(tag => (
                                            <Badge key={tag} className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-none rounded-lg text-[9px] font-black uppercase px-2 py-0.5">
                                                {tag}
                                            </Badge>
                                        )) || <span className="text-[10px] text-zinc-400 italic">Aucune étiquette</span>}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-xl font-black text-xs gap-2 px-4 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                            onClick={() => router.push(`/admin/assets/music/${track.id}`)}
                                        >
                                            <Edit3 className="h-4 w-4" /> Éditer
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                                            onClick={() => setMusicToDelete(track)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {!musicQuery.isLoading && filteredMusic.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 rounded-[40px] border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                            <Music className="h-12 w-12 text-zinc-200 mb-4" />
                            <p className="text-zinc-500 font-bold">Aucune piste musicale trouvée.</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <ConfirmDialog
                open={!!voiceToDelete}
                onOpenChange={(open) => !open && setVoiceToDelete(null)}
                onConfirm={async () => {
                    await deleteVoice(voiceToDelete.id);
                    setVoiceToDelete(null);
                }}
                isLoading={isPending}
                title="Supprimer la Voix"
                description={`Êtes-vous sûr de vouloir supprimer la voix "${voiceToDelete?.name}" ? Cette action est irréversible.`}
                confirmText="Supprimer"
                variant="destructive"
            />

            <ConfirmDialog
                open={!!musicToDelete}
                onOpenChange={(open) => !open && setMusicToDelete(null)}
                onConfirm={async () => {
                    await deleteMusic(musicToDelete.id);
                    setMusicToDelete(null);
                }}
                isLoading={isPending}
                title="Supprimer la Musique"
                description={`Êtes-vous sûr de vouloir supprimer la musique "${musicToDelete?.name}" ? Cette action est irréversible.`}
                confirmText="Supprimer"
                variant="destructive"
            />
        </div>
    );
}

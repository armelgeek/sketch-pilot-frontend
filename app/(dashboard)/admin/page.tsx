"use client";

import { useAdminStats } from "@/src/app/admin";
import {
    Users,
    Video,
    Coins,
    TrendingUp,
    AlertCircle,
    Activity
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import Link from "next/link";

export default function AdminOverviewPage() {
    const { data: stats, isLoading, isError } = useAdminStats();

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-100 dark:border-red-900/30">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Erreur de chargement</h2>
                <p className="text-sm text-red-600 dark:text-red-500 mt-2">Impossible de récupérer les statistiques du serveur.</p>
            </div>
        );
    }

    const cards = [
        {
            title: "Utilisateurs Totaux",
            value: stats?.totalUsers ?? 0,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-950/30",
            description: "Utilisateurs enregistrés sur la plateforme"
        },
        {
            title: "Vidéos Générées",
            value: stats?.totalVideos ?? 0,
            icon: Video,
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-950/30",
            description: "Total des vidéos créées par tous les utilisateurs"
        },
        {
            title: "Crédits Utilisés",
            value: stats?.totalCreditsUsed ?? 0,
            icon: Coins,
            color: "text-amber-600",
            bg: "bg-amber-50 dark:bg-amber-950/30",
            description: "Consommation totale de crédits"
        },
        {
            title: "Crédits Bonus",
            value: stats?.totalExtraCredits ?? 0,
            icon: TrendingUp,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-950/30",
            description: "Crédits supplémentaires octroyés par les admins"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-black tracking-tighter">Tableau de bord</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-1">Aperçu général de l'activité de Sketch Pilot.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                    Array(4).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-3xl" />
                    ))
                ) : (
                    cards.map((card) => (
                        <Card key={card.title} className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-2xl ${card.bg}`}>
                                        <card.icon className={`h-6 w-6 ${card.color}`} />
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                                        <Activity className="h-4 w-4 text-zinc-300" />
                                    </div>
                                </div>
                                <div>
                                    <div className="text-4xl font-black tracking-tighter mb-1">{card.value.toLocaleString()}</div>
                                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{card.title}</div>
                                    <p className="text-[10px] text-zinc-400 mt-1 font-medium">{card.description}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900 rounded-3xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            Répartition par Statut Vidéo
                        </CardTitle>
                        <CardDescription>État actuel de la file d'attente de génération</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-48 rounded-2xl" />
                        ) : (
                            <div className="space-y-4">
                                {stats?.videosByStatus.map((item) => {
                                    const percentage = stats.totalVideos > 0 ? (item.count / stats.totalVideos) * 100 : 0;
                                    return (
                                        <div key={item.status} className="space-y-1">
                                            <div className="flex justify-between text-sm font-bold">
                                                <span className="capitalize">{item.status}</span>
                                                <span>{item.count} ({percentage.toFixed(1)}%)</span>
                                            </div>
                                            <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                {(!stats?.videosByStatus || stats?.videosByStatus.length === 0) && (
                                    <div className="text-center py-8 text-zinc-400 font-medium italic">
                                        Aucune donnée de statut disponible.
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900 rounded-3xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-black tracking-tight">Accès Rapides</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {[
                            { label: "Gérer les utilisateurs", href: "/admin/users" },
                            { label: "Surveiller les jobs", href: "/admin/videos" },
                            { label: "Configurer les voix", href: "/admin/assets?type=voices" },
                            { label: "Ajouter de la musique", href: "/admin/assets?type=music" },
                            { label: "Éditer les prompts", href: "/admin/prompts" },
                            { label: "Gérer les modèles", href: "/admin/models" },
                        ].map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center justify-between p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors font-bold text-sm"
                            >
                                {link.label}
                                <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

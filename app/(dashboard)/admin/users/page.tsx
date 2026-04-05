"use client";

import { useState } from "react";
import { useAdminUsers, AdminUser } from "@/src/app/admin";
import {
    Search,
    Edit3,
    CalendarRange,
    ChevronLeft,
    ChevronRight,
    User as UserIcon,
    ArrowRight,
    Zap,
    Ban,
    ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
    Card,
    CardContent,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Skeleton } from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";

export default function AdminUsersPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const { data: usersRes, isLoading } = useAdminUsers({ page, limit: 12, search });

    const users = usersRes?.data || [];
    const total = usersRes?.total || 0;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white">Gestion des Utilisateurs</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Visualisez, gérez et modifiez les comptes utilisateurs de la plateforme.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-amber-500 transition-colors" />
                        <Input
                            placeholder="Rechercher par nom ou email..."
                            className="pl-11 h-12 w-full md:w-[320px] rounded-[20px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm focus:ring-amber-500/20 font-bold transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* User List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-[280px] rounded-[32px]" />
                    ))
                ) : (
                    users.map((user: AdminUser) => (
                        <Card
                            key={user.id}
                            className="group rounded-[32px] border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden transition-all duration-300 hover:ring-2 ring-amber-500 cursor-pointer"
                            onClick={() => router.push(`/admin/users/${user.id}`)}
                        >
                            <CardContent className="p-0">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <Avatar className="h-14 w-14 rounded-2xl border-2 border-white dark:border-zinc-700 shadow-md">
                                                    <AvatarImage src={user.image || ""} />
                                                    <AvatarFallback className="bg-zinc-100 font-bold text-lg">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className={cn(
                                                    "absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center",
                                                    user.banned ? "bg-red-500" : "bg-amber-500"
                                                )}>
                                                    {user.banned ? <Ban className="h-2.5 w-2.5 text-white" /> : <ShieldCheck className="h-2.5 w-2.5 text-white" />}
                                                </div>
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-black text-zinc-900 dark:text-white truncate tracking-tight">{user.name}</h3>
                                                <p className="text-xs text-zinc-400 font-medium truncate">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="h-10 w-10 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 group-hover:text-amber-500 transition-colors">
                                            <ArrowRight className="h-5 w-5" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Rôle</span>
                                            <Badge variant="outline" className="rounded-lg border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-[10px] font-black px-2 uppercase shadow-sm">
                                                {user.role}
                                            </Badge>
                                        </div>
                                        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Status</span>
                                            <span className={cn(
                                                "text-xs font-black",
                                                user.banned ? "text-red-500" : "text-amber-500"
                                            )}>
                                                {user.banned ? "BLOQUÉ" : "ACTIF"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                                            <CalendarRange className="h-3.5 w-3.5" />
                                            Depuis le {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="sm" className="rounded-xl font-bold text-[10px] gap-1.5 h-8">
                                                <Edit3 className="h-3.5 w-3.5" /> Gérer
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Empty State */}
            {!isLoading && users.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 rounded-[40px] border-2 border-dashed border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <div className="h-20 w-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-[32px] flex items-center justify-center mb-6">
                        <UserIcon className="h-10 w-10 text-zinc-300" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight mb-2">Aucun utilisateur trouvé</h3>
                    <p className="text-zinc-500 font-medium max-w-xs text-center text-sm">
                        {search
                            ? `Aucun résultat pour "${search}".`
                            : "Il n'y a pas encore d'utilisateurs inscrits sur la plateforme."}
                    </p>
                </div>
            )}

            {/* Pagination */}
            {total > 12 && (
                <div className="flex items-center justify-between pt-8">
                    <p className="text-sm font-bold text-zinc-400">
                        Affichage de <span className="text-zinc-900 dark:text-white">{Math.min(users.length, 1) + (page - 1) * 12}</span> à <span className="text-zinc-900 dark:text-white">{Math.min(page * 12, total)}</span> sur <span className="text-zinc-900 dark:text-white">{total}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            className="rounded-xl font-bold gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" /> Précédent
                        </Button>
                        <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-black shadow-lg shadow-zinc-200 dark:shadow-none">
                            {page}
                        </div>
                        <Button
                            variant="ghost"
                            className="rounded-xl font-bold gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            disabled={page * 12 >= total}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Suivant <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

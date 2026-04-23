"use client";

import React from "react";
import Link from "next/link";
import { 
  Film, 
  ChevronRight, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Activity
} from "lucide-react";
import { useVimaxSagas } from "@/src/app/admin/hooks/use-vimax-admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";

export default function VimaxSagasPage() {
  const { data: sagas, isLoading } = useVimaxSagas();
  const [search, setSearch] = React.useState("");

  const filteredSagas = sagas?.filter(s => 
    s.id.toLowerCase().includes(search.toLowerCase()) || 
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 flex items-center gap-3">
            <Film className="h-10 w-10 text-amber-600" />
            Vimax Sagas
          </h1>
          <p className="text-zinc-500 font-medium">Explorez et auditez l'ensemble des productions autonomes.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input 
          placeholder="Rechercher une saga..." 
          className="pl-10 h-12 bg-white/50 border-zinc-200 rounded-2xl font-bold"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-3xl" />
          ))
        ) : filteredSagas?.length === 0 ? (
          <Card className="border-dashed border-2 py-12 rounded-3xl flex flex-col items-center justify-center text-zinc-400">
            <Film className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-bold">Aucune saga trouvée</p>
          </Card>
        ) : (
          filteredSagas?.map((saga) => (
            <Link key={saga.id} href={`/admin/vimax/sagas/${saga.id}`}>
              <Card className="hover:shadow-xl hover:shadow-zinc-200/50 transition-all group rounded-3xl border-zinc-100 overflow-hidden cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-zinc-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Film className="h-6 w-6 text-zinc-400 group-hover:text-amber-600 transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-black text-lg tracking-tight group-hover:text-amber-600 transition-colors">
                          {saga.title}
                        </h3>
                        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-black text-zinc-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {saga.episodeCount} épisodes
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-[200px]">ID: {saga.id}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge className={`${
                        saga.status === 'stable' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      } border-none px-3 py-1 rounded-lg font-black text-[10px]`}>
                        {saga.status.toUpperCase()}
                      </Badge>
                      <ChevronRight className="h-5 w-5 text-zinc-300 group-hover:text-zinc-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

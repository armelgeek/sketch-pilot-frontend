"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, CheckCircle2, History, CreditCard, Layout, Package, Save, X, Loader2 } from "lucide-react";
import { useSubscription, PricingPlan, CreditPack } from "@/src/hooks/use-subscription";
import { pricingAdminService } from "@/src/app/admin/api/pricing-admin-service";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";

// Mock toast if not available
const toast = {
    success: (msg: string) => alert(msg),
    error: (msg: string) => alert(msg),
};

export default function AdminPricingPage() {
    const { getPlans, getPacks } = useSubscription();
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [packs, setPacks] = useState<CreditPack[]>([]);
    const [stripePrices, setStripePrices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingPlan, setEditingPlan] = useState<string | null>(null);
    const [editingPack, setEditingPack] = useState<string | null>(null);
    const [isAddingPlan, setIsAddingPlan] = useState(false);
    const [isAddingPack, setIsAddingPack] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [fetchedPlans, fetchedPacks, { prices }] = await Promise.all([
                getPlans(),
                getPacks(),
                pricingAdminService.getStripePrices()
            ]);
            setPlans(fetchedPlans);
            setPacks(fetchedPacks);
            setStripePrices(prices);
        } catch (error) {
            toast.error("Erreur lors du chargement des données");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleUpdatePlan = async (id: string, data: Partial<PricingPlan>) => {
        setIsSaving(true);
        try {
            await pricingAdminService.updatePlan(id, data);
            toast.success("Plan mis à jour");
            setEditingPlan(null);
            loadData();
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePack = async (id: string, data: Partial<CreditPack>) => {
        setIsSaving(true);
        try {
            await pricingAdminService.updatePack(id, data);
            toast.success("Pack mis à jour");
            setEditingPack(null);
            loadData();
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreatePlan = async (data: Partial<PricingPlan>) => {
        setIsSaving(true);
        try {
            await pricingAdminService.createPlan(data as any);
            toast.success("Plan créé");
            setIsAddingPlan(false);
            loadData();
        } catch (error) {
            toast.error("Erreur lors de la création");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreatePack = async (data: Partial<CreditPack>) => {
        setIsSaving(true);
        try {
            await pricingAdminService.createPack(data as any);
            toast.success("Pack créé");
            setIsAddingPack(false);
            loadData();
        } catch (error) {
            toast.error("Erreur lors de la création");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
                <p className="font-bold text-zinc-400">Chargement des tarifs...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter">Gestion des Tarifs</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Configurez les plans d'abonnement et les packs de crédits.</p>
                </div>
            </div>

            <Tabs defaultValue="plans" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl h-12">
                    <TabsTrigger value="plans" className="rounded-xl font-bold transition-all data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-zinc-800">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Plans
                    </TabsTrigger>
                    <TabsTrigger value="packs" className="rounded-xl font-bold transition-all data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-zinc-800">
                        <Package className="h-4 w-4 mr-2" />
                        Packs
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="plans" className="mt-8 space-y-6">
                    <div className="flex justify-start">
                        <Button
                            className="rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 font-bold"
                            onClick={() => setIsAddingPlan(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Nouveau Plan
                        </Button>
                    </div>

                    {isAddingPlan && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                            <PlanEditor
                                plan={{ id: "", name: "Nouveau Plan", monthlyLimit: 50, priceMonthlyAmount: "0", priceYearlyAmount: "0", currency: "usd", isDefault: false, isFeatured: false, features: [], description: "" }}
                                isEditing={true}
                                onEdit={() => { }}
                                onCancel={() => setIsAddingPlan(false)}
                                onSave={handleCreatePlan}
                                isSaving={isSaving}
                                stripePrices={stripePrices}
                                isNew={true}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {plans.map((plan) => (
                            <PlanEditor
                                key={plan.id}
                                plan={plan}
                                isEditing={editingPlan === plan.id}
                                onEdit={() => setEditingPlan(plan.id)}
                                onCancel={() => setEditingPlan(null)}
                                onSave={(data) => handleUpdatePlan(plan.id, data)}
                                isSaving={isSaving}
                                stripePrices={stripePrices}
                            />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="packs" className="mt-8 space-y-6">
                    <div className="flex justify-start">
                        <Button
                            className="rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 font-bold"
                            onClick={() => setIsAddingPack(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Nouveau Pack
                        </Button>
                    </div>

                    {isAddingPack && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-300 max-w-md">
                            <PackEditor
                                pack={{ id: "", name: "Nouveau Pack", credits: 100, priceAmount: "0", currency: "usd", stripePriceId: "", isFeatured: false, description: "" }}
                                isEditing={true}
                                onEdit={() => { }}
                                onCancel={() => setIsAddingPack(false)}
                                onSave={handleCreatePack}
                                isSaving={isSaving}
                                stripePrices={stripePrices}
                                isNew={true}
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packs.map((pack) => (
                            <PackEditor
                                key={pack.id}
                                pack={pack}
                                isEditing={editingPack === pack.id}
                                onEdit={() => setEditingPack(pack.id)}
                                onCancel={() => setEditingPack(null)}
                                onSave={(data) => handleUpdatePack(pack.id, data)}
                                isSaving={isSaving}
                                stripePrices={stripePrices}
                            />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function PlanEditor({ plan, isEditing, onEdit, onCancel, onSave, isSaving, stripePrices, isNew }: {
    plan: PricingPlan,
    isEditing: boolean,
    onEdit: () => void,
    onCancel: () => void,
    onSave: (data: Partial<PricingPlan>) => void,
    isSaving: boolean,
    stripePrices: any[],
    isNew?: boolean
}) {
    const [formData, setFormData] = useState<Partial<PricingPlan>>(plan);

    const subscriptionPrices = stripePrices.filter(p => p.type === 'recurring');

    return (
        <Card className={cn(
            "border-none shadow-xl transition-all duration-300 rounded-3xl overflow-hidden",
            isEditing ? "ring-2 ring-amber-500" : "hover:shadow-2xl hover:shadow-zinc-200/50"
        )}>
            <CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black tracking-tight">{plan.name}</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">{plan.id}</CardDescription>
                        </div>
                    </div>
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="rounded-xl" onClick={onCancel} disabled={isSaving}>
                                <X className="h-4 w-4" />
                            </Button>
                            <Button variant="default" size="icon" className="rounded-xl bg-amber-600" onClick={() => onSave(formData)} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            </Button>
                        </div>
                    ) : (
                        <Button variant="outline" size="icon" className="rounded-xl" onClick={onEdit}>
                            <Edit2 className="h-4 w-4 text-zinc-400" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                {isEditing ? (
                    <div className="space-y-4">
                        {isNew && (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">ID Unique (ex: starter-plan)</Label>
                                <Input
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                    className="rounded-xl font-bold"
                                    placeholder="identifiant-unique"
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nom du Plan</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="rounded-xl font-bold"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2 p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-amber-700">Prix Mensuel (€)</Label>
                                <Input
                                    type="number"
                                    value={formData.priceMonthlyAmount || ""}
                                    onChange={(e) => setFormData({ ...formData, priceMonthlyAmount: e.target.value })}
                                    className="bg-white rounded-xl font-bold border-amber-200"
                                    placeholder="ex: 29"
                                />
                                {formData.priceMonthlyId && (
                                    <div className="text-[9px] font-mono text-amber-600/60 truncate px-1">
                                        ID: {formData.priceMonthlyId}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2 p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-amber-700">Prix Annuel (€)</Label>
                                <Input
                                    type="number"
                                    value={formData.priceYearlyAmount || ""}
                                    onChange={(e) => setFormData({ ...formData, priceYearlyAmount: e.target.value })}
                                    className="bg-white rounded-xl font-bold border-amber-200"
                                    placeholder="ex: 290"
                                />
                                {formData.priceYearlyId && (
                                    <div className="text-[9px] font-mono text-amber-600/60 truncate px-1">
                                        ID: {formData.priceYearlyId}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Limite Mensuelle (Crédits)</Label>
                            <Input
                                type="number"
                                value={formData.monthlyLimit}
                                onChange={(e) => setFormData({ ...formData, monthlyLimit: Number(e.target.value) })}
                                className="rounded-xl font-bold"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Mettre en avant</Label>
                            <Switch
                                checked={formData.isFeatured}
                                onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Fonctionnalités (Une par ligne)</Label>
                            <Textarea
                                value={formData.features?.join("\n") || ""}
                                onChange={(e) => setFormData({ ...formData, features: e.target.value.split("\n").filter(f => f.trim() !== "") })}
                                className="rounded-xl font-medium min-h-[120px]"
                                placeholder="ex: 50 crédits offerts&#10;Accès illimité&#10;Support 24/7"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Description</Label>
                            <Textarea
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="rounded-xl font-medium"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-500 font-bold text-sm">Prix Mensuel</span>
                            <span className="text-lg font-black">{plan.priceMonthlyAmount} €</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-500 font-bold text-sm">Prix Annuel</span>
                            <span className="text-lg font-black">{plan.priceYearlyAmount} €</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
                            <span className="text-zinc-500 font-bold text-sm">Quota Mensuel</span>
                            <Badge variant="outline" className="rounded-lg font-black bg-amber-50 text-amber-700 border-amber-200">
                                {plan.monthlyLimit} Crédits
                            </Badge>
                        </div>
                        <p className="text-sm text-zinc-400 italic line-clamp-2">{plan.description}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function PackEditor({ pack, isEditing, onEdit, onCancel, onSave, isSaving, stripePrices, isNew }: {
    pack: CreditPack,
    isEditing: boolean,
    onEdit: () => void,
    onCancel: () => void,
    onSave: (data: Partial<CreditPack>) => void,
    isSaving: boolean,
    stripePrices: any[],
    isNew?: boolean
}) {
    const [formData, setFormData] = useState<Partial<CreditPack>>(pack);

    const oneTimePrices = stripePrices.filter(p => p.type === 'one_time' || !p.interval);

    return (
        <Card className={cn(
            "border-none shadow-xl transition-all duration-300 rounded-3xl overflow-hidden",
            isEditing ? "ring-2 ring-amber-500" : "hover:shadow-2xl hover:shadow-zinc-200/50"
        )}>
            <CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white">
                            <Package className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-black tracking-tight">{pack.name}</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">{pack.id}</CardDescription>
                        </div>
                    </div>
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="rounded-xl" onClick={onCancel} disabled={isSaving}>
                                <X className="h-4 w-4" />
                            </Button>
                            <Button variant="default" size="icon" className="rounded-xl bg-amber-600" onClick={() => onSave(formData)} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            </Button>
                        </div>
                    ) : (
                        <Button variant="outline" size="icon" className="rounded-xl" onClick={onEdit}>
                            <Edit2 className="h-4 w-4 text-zinc-400" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                {isEditing ? (
                    <div className="space-y-4">
                        {isNew && (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">ID Unique (ex: basic-pack)</Label>
                                <Input
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                    className="rounded-xl font-bold"
                                    placeholder="identifiant-unique"
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Nom du Pack</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="rounded-xl font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Crédits</Label>
                            <Input
                                type="number"
                                value={formData.credits}
                                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                                className="rounded-xl font-bold"
                            />
                        </div>
                        <div className="space-y-2 p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-amber-700">Prix du Pack (€)</Label>
                            <Input
                                type="number"
                                value={formData.priceAmount || ""}
                                onChange={(e) => setFormData({ ...formData, priceAmount: e.target.value })}
                                className="bg-white rounded-xl font-bold border-amber-200"
                                placeholder="ex: 49"
                            />
                            {formData.stripePriceId && (
                                <div className="text-[9px] font-mono text-amber-600/60 truncate px-1 mt-1">
                                    ID Stripe: {formData.stripePriceId}
                                </div>
                            )}
                        </div>


                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Mettre en avant</Label>
                            <Switch
                                checked={formData.isFeatured}
                                onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-500 font-bold text-sm">Contenu</span>
                            <span className="text-xl font-black">{pack.credits} Crédits</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-500 font-bold text-sm">Prix</span>
                            <span className="text-lg font-black">{pack.priceAmount} €</span>
                        </div>
                        {pack.isFeatured && (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-xl border border-green-100 mt-4">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Mise en avant active</span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

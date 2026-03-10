"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, ChevronRight, Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion";
import { Footer } from "@/src/components/layout/footer";
import { NavbarPublic } from "@/src/components/layout/navbar";
import { useSession } from "@/src/lib/auth-client";

const features = [
  {
    icon: "🎭",
    title: "Cohérence Personnage",
    desc: "Vos personnages restent identiques d'une scène à l'autre, même sur des vidéos de 30 minutes.",
  },
  {
    icon: "🎨",
    title: "Styles Artistiques",
    desc: "Choisissez parmi 12 styles visuels distincts : sketch, cartoon, réaliste, minimaliste et plus.",
  },
  {
    icon: "⏱️",
    title: "Long-Form Ready",
    desc: "Générez des vidéos éducatives complètes, des cours en ligne, sans limite de durée.",
  },
  {
    icon: "🎙️",
    title: "Narration Humaine",
    desc: "Voix synthétiques ultra-réalistes en 8 langues avec synchronisation labiale parfaite.",
  },
];

const steps = [
  {
    n: "01",
    title: "Décrivez votre histoire",
    desc: "Entrez votre script ou décrivez votre sujet. Notre IA génère un storyboard complet.",
  },
  {
    n: "02",
    title: "Personnalisez chaque scène",
    desc: "Ajustez les personnages, les décors, le style visuel et la narration selon votre vision.",
  },
  {
    n: "03",
    title: "Exportez et partagez",
    desc: "Téléchargez votre vidéo en HD ou partagez directement sur vos plateformes.",
  },
];

const mockVideos = [
  { id: 1, title: "La Révolution Industrielle", genre: "Éducatif", duration: "12:30" },
  { id: 2, title: "Comment fonctionne Bitcoin ?", genre: "Tech", duration: "8:45" },
  { id: 3, title: "L'histoire de Marie Curie", genre: "Biographie", duration: "15:20" },
  { id: 4, title: "Les bases de la programmation", genre: "Tutoriel", duration: "22:10" },
  { id: 5, title: "Le changement climatique", genre: "Science", duration: "10:05" },
  { id: 6, title: "Marketing Digital en 2026", genre: "Business", duration: "18:55" },
];

const pricingPlans = [
  {
    name: "Creator",
    price: 49,
    highlighted: false,
    features: [
      "500 crédits / mois",
      "Vidéos jusqu'à 10 min",
      "3 styles visuels",
      "Export HD 1080p",
      "Support email",
    ],
  },
  {
    name: "Professional",
    price: 149,
    highlighted: true,
    features: [
      "2 000 crédits / mois",
      "Vidéos illimitées",
      "12 styles visuels",
      "Export 4K",
      "Personnages personnalisés",
      "Support prioritaire",
    ],
  },
  {
    name: "Business",
    price: 399,
    highlighted: false,
    features: [
      "8 000 crédits / mois",
      "Accès API",
      "Marque blanche",
      "Rendu prioritaire",
      "Manager dédié",
      "SLA garanti",
    ],
  },
];

const testimonials = [
  {
    name: "Sophie Martin",
    role: "Créatrice de contenu",
    text: "Sketch Pilot a transformé ma façon de créer des vidéos éducatives. En 30 minutes, j'ai une vidéo professionnelle prête à publier.",
    avatar: "SM",
  },
  {
    name: "Thomas Leclerc",
    role: "Formateur en ligne",
    text: "La cohérence des personnages entre les scènes est bluffante. Mes élèves adorent le style visuel unique de mes cours.",
    avatar: "TL",
  },
  {
    name: "Amina Diallo",
    role: "Marketing Manager",
    text: "ROI impressionnant. On a réduit notre budget vidéo de 70% tout en doublant notre production de contenu.",
    avatar: "AD",
  },
];

const faqs = [
  {
    q: "Combien de temps faut-il pour générer une vidéo ?",
    a: "Selon la longueur et la complexité, entre 2 et 15 minutes pour une vidéo de 10 minutes.",
  },
  {
    q: "Puis-je utiliser mes propres personnages ?",
    a: "Oui, avec les plans Professional et Business vous pouvez importer vos propres assets et personnages.",
  },
  {
    q: "Quelles langues sont supportées ?",
    a: "8 langues : Français, Anglais, Espagnol, Allemand, Portugais, Arabe, Chinois, Japonais.",
  },
  {
    q: "Les vidéos sont-elles libres de droits ?",
    a: "Oui, toutes les vidéos générées avec votre compte vous appartiennent entièrement.",
  },
  {
    q: "Puis-je annuler mon abonnement à tout moment ?",
    a: "Oui, sans frais ni engagement. Votre abonnement reste actif jusqu'à la fin de la période payée.",
  },
  {
    q: "Y a-t-il une version gratuite ?",
    a: "Nous offrons un essai gratuit de 14 jours avec 50 crédits pour tester toutes les fonctionnalités.",
  },
];

export default function HomePage() {
  const [demoText, setDemoText] = useState("");
  const [activeGenre, setActiveGenre] = useState("Tous");
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.push("/dashboard");
    }
  }, [session, router]);

  const genres = ["Tous", "Éducatif", "Tech", "Biographie", "Tutoriel", "Science", "Business"];
  const filteredVideos =
    activeGenre === "Tous"
      ? mockVideos
      : mockVideos.filter((v) => v.genre === activeGenre);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <NavbarPublic />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
        <Badge variant="secondary" className="mb-4">Nouveau — Vidéos Long-Form jusqu&apos;à 60 min</Badge>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl max-w-4xl mx-auto">
          L&apos;IA qui dessine vos histoires,{" "}
          <span className="text-zinc-600 dark:text-zinc-400">scène après scène.</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-zinc-600 dark:text-zinc-400">
          Créez des vidéos whiteboard captivantes avec des personnages cohérents, une narration
          fluide et des styles artistiques variés — en quelques minutes.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href={session?.user ? "/generate" : "/pricing"}>
              {session?.user ? "Créer une vidéo" : "Démarrer mon projet"} <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#gallery">Voir les résultats</a>
          </Button>
        </div>

        {/* Video placeholder */}
        <div className="mt-16 mx-auto max-w-4xl aspect-video rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border border-zinc-300 dark:border-zinc-700">
          <div className="flex flex-col items-center gap-3 text-zinc-500 dark:text-zinc-400">
            <div className="rounded-full bg-zinc-300 dark:bg-zinc-700 p-5">
              <Play className="h-10 w-10" />
            </div>
            <span className="text-sm font-medium">Démo — Sketch Pilot en action</span>
          </div>
        </div>
      </section>

      {/* Live Demo */}
      <section className="bg-white dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Essayez maintenant</h2>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Entrez votre idée et voyez la magie opérer
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            <Input
              placeholder="Ex : Expliquez comment fonctionne l'IA en 5 minutes..."
              value={demoText}
              onChange={(e) => setDemoText(e.target.value)}
              className="h-12 text-base"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Select>
                <SelectTrigger><SelectValue placeholder="Genre" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="edu">Éducatif</SelectItem>
                  <SelectItem value="tech">Tech</SelectItem>
                  <SelectItem value="bio">Biographie</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="explainer">Explainer</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="tutorial">Tutorial</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger><SelectValue placeholder="Langue" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
              <Button asChild className="w-full">
                <Link href="/register">Générer un exemple</Link>
              </Button>
            </div>
            {/* Static preview */}
            <div className="mt-6 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-6">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                Aperçu du storyboard — Inscrivez-vous pour générer votre vidéo
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-video rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs text-zinc-400"
                  >
                    Scène {i}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Sketch Pilot */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Pourquoi Sketch Pilot ?</h2>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            La seule plateforme conçue pour des vidéos whiteboard long-form professionnelles
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="text-center p-6">
              <div className="text-4xl mb-3">{f.icon}</div>
              <CardTitle className="mb-2">{f.title}</CardTitle>
              <CardDescription>{f.desc}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Comment ça marche ?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.n} className="flex flex-col items-center text-center gap-4">
                <div className="text-5xl font-extrabold text-zinc-200 dark:text-zinc-700">{s.n}</div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Exemples de vidéos</h2>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">Créées entièrement par Sketch Pilot</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGenre(g)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeGenre === g
                  ? "bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:border-zinc-50"
                  : "border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((v) => (
            <Card key={v.id} className="overflow-hidden">
              <div className="aspect-video bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                <Play className="h-10 w-10 text-zinc-400 dark:text-zinc-600" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm">{v.title}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{v.genre} • {v.duration}</p>
                  </div>
                  <Button size="sm" variant="outline">Voir</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="bg-white dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Tarifs simples et transparents</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={plan.highlighted ? "ring-2 ring-zinc-900 dark:ring-zinc-50 relative" : ""}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge>Populaire</Badge>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-3xl font-extrabold mt-1">
                    ${plan.price}
                    <span className="text-sm font-normal text-zinc-500">/mois</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={plan.highlighted ? "default" : "outline"} asChild>
                    <Link href={session?.user ? "/generate" : "/pricing"}>
                      {session?.user ? "Créer maintenant" : "Commencer"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/pricing" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 underline underline-offset-4">
              Voir tous les détails →
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Ce que disent nos utilisateurs</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <Card key={t.name} className="p-6">
              <CardContent className="p-0">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 italic mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Questions fréquentes</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-extrabold sm:text-4xl">
          Prêt à créer votre première vidéo ?
        </h2>
        <p className="mt-4 text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          Rejoignez 10 000+ créateurs qui utilisent Sketch Pilot pour produire du contenu engageant.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href={session?.user ? "/generate" : "/register"}>
              {session?.user ? "Créer une vidéo maintenant" : "Commencer gratuitement"}
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={session?.user ? "/dashboard" : "/pricing"}>
              {session?.user ? "Aller au tableau de bord" : "Voir les tarifs"}
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

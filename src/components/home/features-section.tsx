import { Card, CardContent, CardDescription, CardTitle } from "@/src/components/ui/card";
import { features } from "./data";

export function FeaturesSection() {
  return (
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
  );
}

import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { Play } from "lucide-react";

interface Props {
    params: Promise<{ id: string }>;
}

async function getVideo(id: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    // Using the no-store cache to always fetch the latest data for the shared page.
    const res = await fetch(`${apiUrl}/v1/share/${id}`, { cache: "no-store" });
    if (!res.ok) {
        return null;
    }
    return res.json();
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const video = await getVideo(id);

    if (!video) {
        return {
            title: "Vidéo Introuvable - Sketch Pilot",
        };
    }

    const title = video.title || video.topic || "Vidéo générée par IA";
    const description = "Regardez cette vidéo créée avec Sketch Pilot, la plateforme de génération de vidéos cinématiques par IA.";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

    return {
        title: `${title} - Sketch Pilot`,
        description,
        openGraph: {
            title,
            description,
            url: `${appUrl}/share/${id}`,
            siteName: "Sketch Pilot",
            images: [
                {
                    url: video.thumbnailUrl || `${appUrl}/og-image.jpg`,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            type: "video.other",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [video.thumbnailUrl || `${appUrl}/og-image.jpg`],
        },
    };
}

export default async function SharePage({ params }: Props) {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const video = await getVideo(id);

    if (!video) {
        notFound();
    }

    const title = video.title || video.topic || "Vidéo générée avec AI";

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col">
            {/* Minimalist Header */}
            <header className="border-b bg-white">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
                            S
                        </div>
                        <span className="font-semibold text-zinc-900 tracking-tight">Sketch Pilot</span>
                    </div>
                    <a
                        href="/"
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                        Créer une vidéo →
                    </a>
                </div>
            </header>

            {/* Video Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 lg:py-24">
                <div className="w-full max-w-4xl space-y-8">
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">
                            {title}
                        </h1>
                        <p className="text-zinc-500 max-w-2xl mx-auto text-lg">
                            Cette animation sur tableau blanc a été générée en quelques minutes avec Sketch Pilot.
                        </p>
                    </div>

                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl ring-1 ring-zinc-900/5">
                        {video.videoUrl ? (
                            <video
                                src={video.videoUrl}
                                poster={video.thumbnailUrl || undefined}
                                controls
                                className="w-full h-full object-contain"
                                playsInline
                                crossOrigin="anonymous"
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 gap-4">
                                {video.thumbnailUrl && (
                                    <img
                                        src={video.thumbnailUrl}
                                        alt="Thumbnail"
                                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                                    />
                                )}
                                <Play className="h-12 w-12 opacity-50 relative z-10" />
                                <p className="font-medium relative z-10">La vidéo est en cours de traitement...</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-center">
                        <a
                            href="/"
                            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors shadow-lg hover:shadow-xl"
                        >
                            Générer ma propre vidéo avec Sketch Pilot
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}

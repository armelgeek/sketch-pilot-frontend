"use client";

import { Sparkles, Layers, Video, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ── Confetti spawner ──
   Particles are appended to document.body with position:fixed so they
   are never clipped by any overflow:hidden ancestor.
   We use getBoundingClientRect to place them exactly over the card.
*/
const CONFETTI_COLORS = ["#f59e0b", "#fbbf24", "#fde68a", "#d97706", "#ffffff", "#fb923c"];

function spawnConfetti(anchor: HTMLDivElement | null) {
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    for (let i = 0; i < 36; i++) {
        const el = document.createElement("div");
        const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        // spread particles across the full width of the card
        const x = rect.left + 16 + Math.random() * (rect.width - 32);
        // start from the bottom edge of the card
        const y = rect.bottom - 6;
        const delay = Math.random() * 0.4;
        const r = (Math.random() - 0.5) * 70;
        const size = 5 + Math.random() * 5;
        el.style.cssText = `
            position: fixed;
            width: ${size}px; height: ${size}px;
            border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
            background: ${color};
            left: ${x}px; top: ${y}px;
            pointer-events: none;
            animation: confetti-float 1s ease-out ${delay}s forwards;
            --r: ${r}deg;
            z-index: 9999;
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    }
}

/* ── Global keyframes injected once ── */
const KEYFRAMES = `
@keyframes confetti-float {
    0%   { transform: translateY(0)     rotate(var(--r)) scale(1);   opacity: 1; }
    100% { transform: translateY(-160px) rotate(calc(var(--r) + 200deg)) scale(0.3); opacity: 0; }
}
@keyframes download-pulse {
    0%, 100% { box-shadow: 0 0 0 0px rgba(245,158,11,0.4); }
    50%       { box-shadow: 0 0 0 10px rgba(245,158,11,0); }
}
@keyframes badge-pop {
    0%   { transform: scale(0.7); opacity: 0; }
    70%  { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
}
@keyframes shimmer-slide {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
}
@keyframes fillbar {
    0%   { width: 0% }
    60%  { width: 85% }
    80%  { width: 95% }
    100% { width: 100% }
}
`;

function useInjectKeyframes() {
    useEffect(() => {
        if (document.getElementById("process-section-keyframes")) return;
        const style = document.createElement("style");
        style.id = "process-section-keyframes";
        style.textContent = KEYFRAMES;
        document.head.appendChild(style);
    }, []);
}

/* ── Main section ── */
export function ProcessSection() {
    const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [lineProgress, setLineProgress] = useState<number[]>([0, 0, 0]);
    const [downloadTriggered, setDownloadTriggered] = useState(false);
    const downloadAnchorRef = useRef<HTMLDivElement>(null);
    const downloadFired = useRef(false);

    useInjectKeyframes();

    useEffect(() => {
        const onScroll = () => {
            const newProgress = stepRefs.current.map((el) => {
                if (!el) return 0;
                const rect = el.getBoundingClientRect();
                return Math.max(0, Math.min(1,
                    (window.innerHeight * 0.75 - rect.top) /
                    (window.innerHeight * 0.45)
                ));
            });
            setLineProgress(newProgress);

            const lastStep = stepRefs.current[3];
            if (lastStep) {
                const rect = lastStep.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight * 0.8;

                if (isVisible && !downloadFired.current) {
                    // Entrée dans le viewport → déclencher
                    downloadFired.current = true;
                    setDownloadTriggered(true);
                    spawnConfetti(downloadAnchorRef.current);
                } else if (!isVisible && downloadFired.current) {
                    // Sortie du viewport → réarmer pour le prochain passage
                    downloadFired.current = false;
                    setDownloadTriggered(false);
                }
            }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    return (
        <section className="relative py-24 md:py-32 bg-white border-t border-zinc-100" id="process">
            <div className="mx-auto max-w-4xl px-6 lg:px-8 relative z-10">
                <div className="flex flex-col items-start md:items-center md:text-center mb-20">
                    <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase text-amber-500 mb-2">
                        How it works
                    </p>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-zinc-950 mb-6 leading-tight tracking-tight max-w-2xl">
                        Creation, <span className="text-amber-500">simplified.</span>
                    </h2>
                    <p className="text-lg text-zinc-500 leading-relaxed max-w-2xl">
                        You provide the topic. Our AI engine handles the script, voiceover, animation, and editing from start to finish.
                    </p>
                </div>

                {/* Timeline */}
                <div className="flex flex-col max-w-2xl mx-auto">
                    {steps.map((step, i) => (
                        <div
                            key={i}
                            ref={(el) => { stepRefs.current[i] = el; }}
                            className="grid gap-x-6 md:gap-x-8"
                            style={{ gridTemplateColumns: "40px 1fr" }}
                        >
                            {/* Left: dot + line */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors duration-300 ${lineProgress[i - 1] >= 0.5 || i === 0
                                        ? "bg-amber-500 text-white shadow-[0_4px_14px_rgba(245,158,11,0.3)]"
                                        : "bg-zinc-100 text-zinc-400"
                                        }`}
                                >
                                    <step.icon className="w-4 h-4" />
                                </div>
                                {i < steps.length - 1 && (
                                    <div className="w-[1.5px] flex-1 bg-zinc-100 my-2 relative overflow-hidden">
                                        <div
                                            className="absolute top-0 left-0 w-full bg-amber-500 transition-all duration-300"
                                            style={{ height: `${(lineProgress[i] ?? 0) * 100}%` }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Right: content */}
                            <div className={i < steps.length - 1 ? "pb-16" : ""}>
                                <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-amber-500 max-w-fit px-2 py-0.5 rounded bg-amber-50 mb-3">
                                    Step 0{i + 1}
                                </p>
                                <h3 className="text-2xl font-bold text-zinc-950 mb-3 tracking-tight">
                                    {step.title}
                                </h3>
                                <p className="text-base text-zinc-500 leading-relaxed mb-6">
                                    {step.desc}
                                </p>
                                <div>
                                    {i === 3
                                        ? <StepFourPreview triggered={downloadTriggered} anchorRef={downloadAnchorRef} />
                                        : step.preview
                                    }
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ── Preview sub-components ── */

function PreviewBox({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl px-5 py-4 flex items-center gap-3">
            {children}
        </div>
    );
}

function StepOnePreview() {
    return (
        <PreviewBox>
            <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold text-sm">
                T
            </div>
            <input
                readOnly
                value="The psychology of procrastination"
                className="text-[14px] font-medium text-zinc-700 bg-transparent border-none outline-none flex-1 pointer-events-none"
            />
        </PreviewBox>
    );
}

function StepTwoPreview() {
    const pills = ["Psychology", "Finance", "History", "Productivity"];
    return (
        <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl px-5 py-4 flex flex-wrap gap-2.5">
            {pills.map((p) => (
                <span
                    key={p}
                    className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${p === "Psychology"
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-white text-zinc-500 border-zinc-200/80"
                        }`}
                >
                    {p}
                </span>
            ))}
        </div>
    );
}

function StepThreePreview() {
    const rows = [
        { label: "Script", status: "Done" },
        { label: "Voiceover", status: "Done" },
        { label: "Visuals", status: "Rendering" },
    ];
    return (
        <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl px-6 py-5 flex flex-col gap-4">
            {rows.map((r) => (
                <div key={r.label} className="flex items-center gap-4 w-full">
                    <span className="text-xs font-semibold text-zinc-500 w-20 shrink-0">{r.label}</span>
                    <div className="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{
                                animation: r.status === "Rendering" ? "fillbar 2.4s ease-in-out infinite" : "none",
                                width: r.status === "Done" ? "100%" : undefined,
                            }}
                        />
                    </div>
                    <span className={`text-[11px] font-bold w-16 text-right ${r.status === "Done" ? "text-amber-600" : "text-zinc-400"}`}>
                        {r.status}
                    </span>
                </div>
            ))}
        </div>
    );
}

function StepFourPreview({
    triggered,
    anchorRef,
}: {
    triggered: boolean;
    anchorRef: React.RefObject<HTMLDivElement>;
}) {
    return (
        <div ref={anchorRef} style={{ position: "relative" }}>
            {/* Card */}
            <div
                className="bg-zinc-50 border border-zinc-200/60 rounded-xl px-5 py-4 flex items-center gap-3 transition-all duration-300"
                style={triggered ? {
                    borderColor: "#f59e0b",
                    animation: "download-pulse 1.4s ease 0.1s 2",
                } : {}}
            >
                {/* Icon */}
                <div
                    className="h-10 w-10 rounded-lg bg-amber-500 flex items-center justify-center shrink-0 transition-transform duration-300"
                    style={triggered ? { transform: "scale(1.1)" } : {}}
                >
                    <Video className="h-4 w-4 text-white" />
                </div>

                {/* File info */}
                <div className="flex flex-col flex-1 pl-1">
                    <span className="text-[13px] font-bold text-zinc-800">
                        psychology_procrastination.mp4
                    </span>
                    <span className="text-[11px] font-medium text-zinc-500">
                        1920×1080 · 120 MB
                    </span>
                </div>

                {/* Badge */}
                <span
                    className="text-[10px] font-bold text-amber-700 bg-amber-100/50 rounded-full px-3 py-1 ring-1 ring-amber-200"
                    style={triggered ? {
                        animation: "badge-pop 0.45s cubic-bezier(.34,1.56,.64,1) 0.12s both",
                    } : {}}
                >
                    4K Ready
                </span>
            </div>

            {/* Shimmer line */}
            <div
                className="mt-2 h-[2px] rounded-full"
                style={triggered ? {
                    background: "linear-gradient(90deg, #f59e0b 0%, #fef3c7 50%, #f59e0b 100%)",
                    backgroundSize: "200% auto",
                    animation: "shimmer-slide 1.2s linear 0.15s 3",
                } : { opacity: 0 }}
            />
        </div>
    );
}

/* ── Steps data ── */

const steps = [
    {
        title: "Choose your topic",
        desc: "Enter any video idea. The AI immediately structures the narrative arc for you based on viral retention metrics.",
        icon: Sparkles,
        preview: <StepOnePreview />,
    },
    {
        title: "Select your style",
        desc: "Pick a content category. Our pipeline generates cohesive Whiteboard aesthetics and a premium voiceover.",
        icon: Layers,
        preview: <StepTwoPreview />,
    },
    {
        title: "AI generates everything",
        desc: "Script, narration, animations, and editing happen automatically. Review and refine directly in the studio.",
        icon: Video,
        preview: <StepThreePreview />,
    },
    {
        title: "Download your video",
        desc: "Rendering takes just a few minutes. Export in 4K with baked-in captions and cinematic transitions — ready to publish.",
        icon: Download,
        preview: null, // rendered separately to pass refs & triggered state
    },
];
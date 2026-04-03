"use client";

import { Youtube, Instagram, Twitter, Twitch, Layers, MonitorPlay, Smartphone } from "lucide-react";

// Expanded list for better scrolling, with explicit brand hover colors
const content = [
    { name: "YouTube Shorts", icon: Youtube, hoverClass: "group-hover:text-[#FF0000]" },
    { name: "TikTok", icon: Smartphone, hoverClass: "group-hover:text-zinc-950" },
    { name: "Instagram Reels", icon: Instagram, hoverClass: "group-hover:text-[#E1306C]" },
    { name: "X (Twitter)", icon: Twitter, hoverClass: "group-hover:text-zinc-950" },
    { name: "Snapchat", icon: Twitch, hoverClass: "group-hover:text-[#FFFC00]" },
    { name: "Facebook Watch", icon: MonitorPlay, hoverClass: "group-hover:text-[#1877F2]" },
    { name: "Pinterest", icon: Layers, hoverClass: "group-hover:text-[#E60023]" },
];

export function PlatformsTicker() {
    return (
        <section className="py-12 border-t border-b border-zinc-200/50 bg-white overflow-hidden relative">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16 px-4 md:px-8">

                {/* Title Side */}
                <div className="whitespace-nowrap shrink-0 z-10 bg-white md:pr-4">
                    <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-4">
                        <span className="w-8 h-px bg-zinc-300 hidden sm:block" />
                        Perfect for modern platforms
                    </p>
                </div>

                {/* Scrolling Ticker Area */}
                <div className="relative flex overflow-hidden w-full mask-edges group/ticker">
                    {/* Duplicate the container twice for seamless loop */}
                    <div className="flex animate-marquee shrink-0 items-center justify-around gap-12 sm:gap-20 min-w-full opacity-60 group-hover/ticker:opacity-100 transition-opacity duration-700 pr-12 sm:pr-20">
                        {content.map((platform, idx) => {
                            const Icon = platform.icon;
                            return (
                                <div key={`a-${idx}`} className="flex items-center gap-2.5 group cursor-default">
                                    <Icon className={`w-5 h-5 text-zinc-500 transition-colors duration-300 ${platform.hoverClass}`} />
                                    <span className={`font-heading font-black text-lg sm:text-xl text-zinc-500 transition-colors duration-300 whitespace-nowrap ${platform.hoverClass}`}>
                                        {platform.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex animate-marquee shrink-0 items-center justify-around gap-12 sm:gap-20 min-w-full opacity-60 group-hover/ticker:opacity-100 transition-opacity duration-700 pr-12 sm:pr-20" aria-hidden="true">
                        {content.map((platform, idx) => {
                            const Icon = platform.icon;
                            return (
                                <div key={`b-${idx}`} className="flex items-center gap-2.5 group cursor-default">
                                    <Icon className={`w-5 h-5 text-zinc-500 transition-colors duration-300 ${platform.hoverClass}`} />
                                    <span className={`font-heading font-black text-lg sm:text-xl text-zinc-500 transition-colors duration-300 whitespace-nowrap ${platform.hoverClass}`}>
                                        {platform.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>

            <style>{`
        .mask-edges {
          mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
        }
        
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        
        /* Pause on hover using the parent ticker group */
        .group\\/ticker:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>
        </section>
    );
}

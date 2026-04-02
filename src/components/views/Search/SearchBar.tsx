"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
    autoFocus?: boolean;
    onResultClick?: () => void;
}

const SearchBar = ({ autoFocus = false, onResultClick }: SearchBarProps) => {
    const [query, setQuery] = useState("");

    return (
        <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={16} className="text-muted-foreground group-focus-within:text-foreground transition-colors" />
            </div>
            <input
                type="search"
                autoFocus={autoFocus}
                className="block w-full h-[36px] pl-10 pr-4 text-sm bg-muted/50 border border-transparent rounded-[3px] focus:outline-none focus:bg-white focus:border-emerald-500/50 transition-all"
                placeholder="Rechercher..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && onResultClick) {
                        onResultClick();
                    }
                }}
            />
        </div>
    );
};

export default SearchBar;

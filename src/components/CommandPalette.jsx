import { useState, useEffect, useMemo, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowRight, CornerDownLeft } from 'lucide-react';

export function CommandPalette({ isOpen, onClose, categories, teams = [], initialQuery = '', onIncrementClick }) {
    const [query, setQuery] = useState(initialQuery);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Sync query with initialQuery when it changes (or when reopening)
    // Sync query with initialQuery when it changes (or when reopening) - Handled by fresh mount
    // Component unmounts on close, so state resets automatically.

    // Flatten all URLs into a searchable list
    const allItems = useMemo(() => {
        const items = [];

        // Add personal categories
        categories.forEach(cat => {
            cat.urls.forEach(url => {
                items.push({
                    type: 'url',
                    id: url.id,
                    title: url.title,
                    subtitle: cat.name, // Collection name as subtitle
                    url: url.url,
                    icon: url.customFavicon || `https://www.google.com/s2/favicons?domain=${new URL(url.url).hostname}`,
                    originalObj: url,
                    categoryId: cat.id,
                    clickCount: url.clickCount || 0
                });
            });
        });

        // Add team categories
        teams.forEach(team => {
            if (team.categories) {
                team.categories.forEach(cat => {
                    if (cat.urls) {
                        cat.urls.forEach(url => {
                            items.push({
                                type: 'url',
                                id: url.id,
                                title: url.title || url.url,
                                subtitle: `${team.name} • ${cat.name}`,
                                url: url.url,
                                icon: url.customFavicon || `https://www.google.com/s2/favicons?domain=${new URL(url.url).hostname}`,
                                originalObj: url,
                                categoryId: cat.id,
                                clickCount: url.clickCount || 0
                            });
                        });
                    }
                });
            }
        });

        // Sort by click count for better relevance!
        return items.sort((a, b) => b.clickCount - a.clickCount);
    }, [categories, teams]);

    // Filter items based on query
    const filteredItems = useMemo(() => {
        if (!query) return allItems.slice(0, 10); // Show top 10 recent/popular by default
        return allItems.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.url.toLowerCase().includes(query.toLowerCase()) ||
            item.subtitle.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8); // Limit results
    }, [query, allItems]);

    const handleSelect = useCallback((item) => {
        if (item.type === 'url') {
            window.open(item.url, '_blank');
            onIncrementClick(item.categoryId, item.id);
            onClose();
            setQuery(''); // Reset query
        }
    }, [onIncrementClick, onClose]);

    // Reset selection when query changes
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedIndex(0);
    }, [query]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredItems.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredItems[selectedIndex]) {
                    handleSelect(filteredItems[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredItems, selectedIndex, onClose, handleSelect]);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Dialog */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="w-full max-w-xl bg-[#09090b] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[60vh]"
            >
                {/* Search Header */}
                <div className="flex items-center px-4 py-4 border-b border-[var(--border-subtle)] gap-3">
                    <Search className="w-5 h-5 text-[var(--text-tertiary)]" />
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Type a command or search..."
                        className="cmd-palette-input flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-lg h-full"
                    />
                    <div className="px-2 py-1 rounded bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-tertiary)] font-mono">
                        ESC
                    </div>
                </div>

                {/* Results List */}
                <div className="overflow-y-auto flex-1 p-2 space-y-1 scrollbar-hide">
                    {filteredItems.length === 0 ? (
                        <div className="py-8 text-center text-[var(--text-tertiary)] text-sm">
                            No results found.
                        </div>
                    ) : (
                        filteredItems.map((item, index) => (
                            <button
                                key={`${item.id}-${index}`}
                                onClick={() => handleSelect(item)}
                                onMouseEnter={() => setSelectedIndex(index)}
                                className={`w-full text-left px-3 py-3 rounded-xl flex items-center gap-3 transition-colors ${index === selectedIndex
                                    ? 'bg-[var(--bg-card-hover)]'
                                    : 'hover:bg-[var(--bg-input)]'
                                    }`}
                            >
                                {/* Icon */}
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-[var(--border-subtle)] ${index === selectedIndex ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-[var(--bg-input)]'}`}>
                                    <img
                                        src={item.icon}
                                        className="w-4 h-4 object-contain opacity-80"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                    {/* Fallback layout not ideal but good enough for MVP */}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h4 className={`text-sm font-medium truncate ${index === selectedIndex ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                            {item.title}
                                        </h4>
                                        {index === selectedIndex && (
                                            <CornerDownLeft className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-[var(--text-tertiary)]">{item.subtitle}</span>
                                        {item.clickCount > 0 && (
                                            <span className="text-[10px] px-1.5 rounded-full bg-[var(--bg-input)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]">
                                                {item.clickCount} visits
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-[var(--bg-input)] border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
                    <span>
                        <span className="font-medium text-[var(--text-secondary)]">ProTip:</span> Use arrow keys to navigate
                    </span>
                    <div className="flex items-center gap-4">
                        <span>Open Link ↵</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

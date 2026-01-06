import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Edit2, X, Globe, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

export function UrlTile({ url, index, onEdit, onDelete, onClick }) {
    const [isHovered, setIsHovered] = useState(false);
    const [imgError, setImgError] = useState(false);

    // Parse hostname for cleaner display
    const hostname = (() => {
        try {
            return new URL(url.url).hostname.replace(/^www\./, '');
        } catch {
            return url.url;
        }
    })();

    const [faviconSrc, setFaviconSrc] = useState(
        url.customFavicon || `https://unavatar.io/${new URL(url.url).hostname}?fallback=false`
    );



    const handleImageError = () => {
        if (url.customFavicon && faviconSrc === url.customFavicon) {
            // If custom one failed, revert to auto
            setFaviconSrc(`https://unavatar.io/${new URL(url.url).hostname}?fallback=false`);
        } else {
            // If auto failed (or was already auto), show Generic Icon (Letter)
            setImgError(true);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative"
        >
            <a
                href={url.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClick}
                className="block p-3 rounded-xl bg-[var(--bg-input)] border border-transparent hover:border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] transition-all duration-200 group-hover:shadow-lg flex items-center gap-3.5"
            >
                {/* Favicon with Glow */}
                <div className="relative">
                    <div className={`absolute inset-0 bg-white/20 blur-md rounded-lg transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
                    <div className="relative w-9 h-9 rounded-lg bg-[#18181b] border border-[var(--border-subtle)] flex items-center justify-center flex-shrink-0 z-10 transition-transform duration-200 group-hover:scale-105 overflow-hidden">
                        {!imgError ? (
                            <img
                                src={faviconSrc}
                                alt=""
                                className="w-5 h-5 object-contain opacity-90 group-hover:opacity-100"
                                onError={handleImageError}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[var(--bg-card-hover)] text-[var(--text-secondary)] font-bold text-sm uppercase">
                                {url.title?.charAt(0) || <Globe className="w-4 h-4" />}
                            </div>
                        )}
                    </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {url.title}
                        </h4>
                        {/* External Icon (Visible on Hover) */}
                        <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-secondary)] opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                    </div>
                    <p className="text-[11px] text-[var(--text-tertiary)] truncate group-hover:text-[var(--text-secondary)] transition-colors">
                        {hostname}
                    </p>
                </div>
            </a>

            {/* Floating Action Menu (Glass) */}
            {/* Actions (Only validation: if handlers exist) */}
            {(onEdit || onDelete) && (
                <div className={`absolute top-2 right-2 flex gap-1 transition-all duration-200 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
                    }`}>
                    {onEdit && (
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
                            className="p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] shadow-lg"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
                            className="p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-red-400 hover:border-red-400 shadow-lg"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
}

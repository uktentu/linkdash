import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Plus, MoreHorizontal, Folder, FolderOpen, Edit2, Trash2, Briefcase, User, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UrlTile } from './UrlTile';

export function CategoryCard({ category, viewMode, onEdit, onDelete, onAddUrl, onEditUrl,
    onDeleteUrl,
    isReadOnly = false,
    onIncrementClick,
    linkLayout = 'list' // New prop with default
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: category.id, disabled: isReadOnly });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`card-premium rounded-2xl flex flex-col group ${isDragging ? 'shadow-2xl ring-2 ring-[var(--primary-500)]' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => { setIsHovered(false); setIsMenuOpen(false); }}
            >
                {/* Header */}
                <div className="relative p-5 pl-12 flex items-center justify-between border-b border-[var(--border-subtle)]/50">
                    {/* Drag Handle - Absolute Position to prevent layout shift */}
                    {!isReadOnly && (
                        <div
                            {...attributes}
                            {...listeners}
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 cursor-grab active:cursor-grabbing text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-input)]/50 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200"
                        >
                            <GripVertical className="w-5 h-5" />
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-secondary)] border border-[var(--border-subtle)] shadow-sm group-hover:bg-[var(--bg-card-hover)] transition-colors">
                            {category.urls.length > 0 ? (
                                <FolderOpen className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                            ) : (
                                <Folder className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-[var(--text-primary)] tracking-tight">{category.name}</h3>
                            <p className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-2">
                                <span>{category.urls.length} Links</span>
                                {category.mode === 'work' && <Briefcase className="w-3 h-3 text-[var(--text-tertiary)]" />}
                                {category.mode === 'personal' && <User className="w-3 h-3 text-[var(--text-tertiary)]" />}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center -mr-2">
                        {!isReadOnly && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onAddUrl}
                                className="btn-icon p-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity focus:opacity-100"
                                title="Add Link"
                            >
                                <Plus className="w-5 h-5" />
                            </motion.button>
                        )}

                        {!isReadOnly && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className={`p-2 rounded-lg transition-all ${isHovered ? 'opacity-100' : 'opacity-100 lg:opacity-0'
                                        } hover:bg-[var(--bg-card-hover)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]`}
                                >
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>

                                <AnimatePresence>
                                    {isMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                            className="absolute right-0 top-full mt-2 w-48 py-1 rounded-xl bg-[#1a1a1f] border border-[var(--border-subtle)] shadow-2xl z-20 overflow-hidden"
                                        >
                                            <button
                                                onClick={() => { setIsMenuOpen(false); onEdit(); }}
                                                className="w-full px-4 py-2.5 text-left text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] flex items-center gap-2"
                                            >
                                                <Edit2 className="w-4 h-4" /> Rename Collection
                                            </button>
                                            <button
                                                onClick={() => { setIsMenuOpen(false); onDelete(); }}
                                                className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" /> Delete Collection
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grid */}
                <div className="p-5 flex-1 relative">
                    <AnimatePresence mode="popLayout">
                        {category.urls.length === 0 ? (
                            <button
                                onClick={isReadOnly ? undefined : onAddUrl}
                                disabled={isReadOnly}
                                className={`w-full h-32 rounded-xl border-2 border-dashed border-[var(--border-subtle)] flex flex-col items-center justify-center gap-3 group/empty transition-all duration-300 ${isReadOnly ? 'cursor-default opacity-50' : 'cursor-pointer hover:border-[var(--primary-500)]/50 hover:bg-[var(--bg-card-hover)]'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isReadOnly ? 'bg-[var(--bg-input)] text-[var(--text-tertiary)]' : 'bg-[var(--bg-input)] text-[var(--text-secondary)] group-hover/empty:bg-[var(--primary-500)]/10 group-hover/empty:text-[var(--primary-500)] group-hover/empty:scale-110'
                                    }`}>
                                    {isReadOnly ? <Folder className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                </div>
                                <p className={`text-xs font-medium transition-colors ${isReadOnly ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-secondary)] group-hover/empty:text-[var(--primary-500)]'
                                    }`}>
                                    {isReadOnly ? 'Empty Collection' : 'Add your first link'}
                                </p>
                            </button>
                        ) : (
                            <div className={`grid gap-3 ${linkLayout === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                <AnimatePresence initial={false} mode="popLayout">
                                    {category.urls.map((url, idx) => (
                                        <UrlTile
                                            key={url.id}
                                            url={url}
                                            index={idx}
                                            viewMode={viewMode}
                                            onEdit={isReadOnly ? null : () => onEditUrl(url)}
                                            onDelete={isReadOnly ? null : () => onDeleteUrl(url.id)}
                                            onClick={() => onIncrementClick && onIncrementClick(category.id, url.id)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </AnimatePresence>
                </div >
            </motion.div >
        </div >
    );
}

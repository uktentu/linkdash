import { Modal } from './Modal';
import { Check, Palette, Grid, Circle, List, LayoutGrid } from 'lucide-react';

export function SettingsModal({ isOpen, onClose, currentTheme, currentPattern, currentLinkLayout = 'list', onUpdate }) {
    const themes = [
        { id: 'theme-white', name: 'White', color: '#ffffff' },
        { id: 'theme-indigo', name: 'Indigo', color: '#6366f1' },
        { id: 'theme-violet', name: 'Violet', color: '#8b5cf6' },
        { id: 'theme-rose', name: 'Rose', color: '#f43f5e' },
        { id: 'theme-teal', name: 'Teal', color: '#14b8a6' },
        { id: 'theme-amber', name: 'Amber', color: '#f59e0b' },
    ];

    const patterns = [
        { id: 'dots', name: 'Dots', icon: Circle },
        { id: 'grid', name: 'Grid', icon: Grid },
        { id: 'none', name: 'Plain', icon: null },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Appearance Settings">
            <div className="space-y-6">
                {/* Color Picker */}
                <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
                        Accent Color
                    </label>
                    <div className="flex gap-3">
                        {themes.map(t => (
                            <button
                                key={t.id}
                                onClick={() => onUpdate({ theme: t.id })}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentTheme === t.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#09090b] scale-110' : 'hover:scale-105'
                                    }`}
                                style={{ backgroundColor: t.color }}
                                title={t.name}
                            >
                                {currentTheme === t.id && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Pattern Picker */}
                <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
                        Background Pattern
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {patterns.map(p => (
                            <button
                                key={p.id}
                                onClick={() => onUpdate({ pattern: p.id })}
                                className={`h-24 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${currentPattern === p.id
                                    ? 'bg-[var(--bg-input)] border-[var(--primary-color)] text-[var(--text-primary)]'
                                    : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:border-[var(--text-secondary)]'
                                    }`}
                            >
                                {p.icon ? <p.icon className="w-6 h-6" /> : <div className="w-6 h-6 border rounded-sm" />}
                                <span className="text-xs font-medium">{p.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Link Layout Picker */}
                <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
                        Link Layout
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {['list', 'grid'].map(layout => (
                            <button
                                key={layout}
                                onClick={() => onUpdate({ linkLayout: layout })}
                                className={`h-20 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${currentLinkLayout === layout
                                    ? 'bg-[var(--bg-input)] border-[var(--primary-color)] text-[var(--text-primary)]'
                                    : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:border-[var(--text-secondary)]'
                                    }`}
                            >
                                {layout === 'list' ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
                                <span className="text-xs font-medium capitalize">{layout}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-6 mt-6 border-t border-[var(--border-subtle)]">
                <button
                    onClick={onClose}
                    className="btn-primary px-6 py-2.5 rounded-xl text-sm"
                >
                    Done
                </button>
            </div>
        </Modal>
    );
}

import { Modal } from './Modal';
import { Check, Palette, Grid, Circle, List, LayoutGrid, Download, Upload, FileJson, FileCode } from 'lucide-react';
import { exportToJson, exportToHtml, parseHtmlBookmarks } from '../utils/dataUtils';
import { useRef } from 'react';

export function SettingsModal({ isOpen, onClose, currentTheme, currentPattern, currentLinkLayout = 'list', onUpdate, localData, onImport }) {
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            let success = false;

            if (file.name.endsWith('.json')) {
                const json = JSON.parse(text);
                success = onImport(json);
            } else if (file.name.endsWith('.html')) {
                const parsedData = parseHtmlBookmarks(text);
                success = onImport(parsedData);
            }

            if (success) {
                alert('Import successful!');
                onClose();
            } else {
                alert('Invalid file format.');
            }
        } catch (error) {
            console.error('Import failed:', error);
            alert('Failed to import file.');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
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
                                {currentTheme === t.id && <Check className={`w-5 h-5 drop-shadow-md ${t.id === 'theme-white' ? 'text-black' : 'text-white'}`} />}
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

                {/* Data & Management */}
                <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
                        Data Portability
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                        <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">

                            {/* Export Actions */}
                            <div>
                                <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">Export Data</h4>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => exportToJson(localData)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-sm font-medium transition-colors border border-transparent hover:border-[var(--border-subtle)]"
                                    >
                                        <FileJson className="w-4 h-4" />
                                        JSON Backup
                                    </button>
                                    <button
                                        onClick={() => exportToHtml(localData)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-input)] hover:bg-[var(--bg-card-hover)] text-sm font-medium transition-colors border border-transparent hover:border-[var(--border-subtle)]"
                                    >
                                        <FileCode className="w-4 h-4" />
                                        HTML Bookmarks
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-[var(--border-subtle)]" />

                            {/* Import Action */}
                            <div>
                                <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">Import Data</h4>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".json,.html"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--primary-color)] text-white hover:opacity-90 text-sm font-medium transition-opacity"
                                >
                                    <Upload className="w-4 h-4" />
                                    Import from File (JSON / HTML)
                                </button>
                                <p className="text-[10px] text-[var(--text-tertiary)] mt-2 text-center">
                                    Supports LinkDash JSON backups and Browser HTML bookmarks (Chrome, Safari, etc.)
                                </p>
                            </div>
                        </div>
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
        </Modal >
    );
}

import { Modal } from './Modal';
import { Check, Palette, Grid, Circle, List, LayoutGrid, Download, Upload, FileJson, FileCode, Database, Smartphone, Laptop } from 'lucide-react';
import { exportToJson, exportToHtml, parseHtmlBookmarks } from '../utils/dataUtils';
import { useState, useRef } from 'react';

export function SettingsModal({ isOpen, onClose, currentTheme, currentPattern, currentLinkLayout = 'list', onUpdate, localData, onImport }) {
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('appearance'); // 'appearance' | 'data'
    const [importGuide, setImportGuide] = useState(null);

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
        <Modal isOpen={isOpen} onClose={onClose} title="Settings">
            <div className="flex flex-col h-full">
                {/* Tabs Header */}
                <div className="flex gap-2 p-1 mb-6 bg-[var(--bg-input)] rounded-xl border border-[var(--border-subtle)]">
                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'appearance'
                            ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                            }`}
                    >
                        <Palette className="w-4 h-4" />
                        Appearance
                    </button>
                    <button
                        onClick={() => setActiveTab('data')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'data'
                            ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                            }`}
                    >
                        <Database className="w-4 h-4" />
                        Data & Backup
                    </button>
                </div>

                <div className="space-y-6">
                    {activeTab === 'appearance' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
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
                        </div>
                    )}

                    {activeTab === 'data' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                            {/* Export Section */}
                            <section>
                                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
                                    Export & Backup
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        onClick={() => exportToJson(localData)}
                                        className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-all group text-center"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <FileJson className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-[var(--text-primary)]">JSON Backup</div>
                                            <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Full dashboard state</div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => exportToHtml(localData)}
                                        className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--text-secondary)] transition-all group text-center"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <FileCode className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-[var(--text-primary)]">HTML Bookmarks</div>
                                            <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">For browser import</div>
                                        </div>
                                    </button>
                                </div>
                            </section>

                            <div className="h-px bg-[var(--border-subtle)]" />

                            {/* Import Section */}
                            <section>
                                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
                                    Import Data
                                </label>
                                <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">

                                    {/* Browser Guides Selection */}
                                    {!importGuide ? (
                                        <div className="space-y-4">
                                            <div className="text-sm text-[var(--text-secondary)] mb-3">
                                                Select source to view export instructions:
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                {['Chrome', 'Safari', 'Edge', 'Firefox'].map(browser => (
                                                    <button
                                                        key={browser}
                                                        onClick={() => setImportGuide(browser)}
                                                        className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-[var(--bg-input)] transition-colors"
                                                    >
                                                        {/* Simple placeholders for logos - using generic Laptop icon for MVP readability */}
                                                        <div className="w-8 h-8 rounded-full bg-[var(--bg-input)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors">
                                                            <Laptop className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-[10px] font-medium text-[var(--text-secondary)]">{browser}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mb-6 p-4 rounded-lg bg-[var(--bg-input)]/50 border border-[var(--border-subtle)] animate-in fade-in slide-in-from-top-1 duration-200">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                                    <Laptop className="w-4 h-4" />
                                                    Exporting from {importGuide}
                                                </h4>
                                                <button
                                                    onClick={() => setImportGuide(null)}
                                                    className="text-[10px] font-medium px-2 py-1 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-input)] transition-colors"
                                                >
                                                    Change Browser
                                                </button>
                                            </div>
                                            <ol className="list-decimal list-inside space-y-2 text-xs text-[var(--text-secondary)]">
                                                {importGuide === 'Chrome' && (
                                                    <>
                                                        <li>Click <span className="font-mono bg-black/10 dark:bg-white/10 rounded px-1">⋮</span> (Menu) top-right</li>
                                                        <li>Go to <b>Bookmarks</b> → <b>Bookmark Manager</b></li>
                                                        <li>Click the top-right <span className="font-mono bg-black/10 dark:bg-white/10 rounded px-1">⋮</span> menu inside the manager</li>
                                                        <li>Select <b>Export Bookmarks</b></li>
                                                    </>
                                                )}
                                                {importGuide === 'Safari' && (
                                                    <>
                                                        <li>Click <b>File</b> in the top menu bar</li>
                                                        <li>Select <b>Export</b> → <b>Bookmarks</b></li>
                                                        <li>Save the HTML file</li>
                                                    </>
                                                )}
                                                {importGuide === 'Edge' && (
                                                    <>
                                                        <li>Click the <b>Star Icon</b> (Favorites)</li>
                                                        <li>Click <span className="font-mono bg-black/10 dark:bg-white/10 rounded px-1">⋯</span> (Options)</li>
                                                        <li>Select <b>Export favorites</b></li>
                                                    </>
                                                )}
                                                {importGuide === 'Firefox' && (
                                                    <>
                                                        <li>Press <span className="font-mono bg-black/10 dark:bg-white/10 rounded px-1">Ctrl+Shift+O</span> to open Library</li>
                                                        <li>Click <b>Import and Backup</b> in the toolbar</li>
                                                        <li>Select <b>Export Bookmarks to HTML</b></li>
                                                    </>
                                                )}
                                            </ol>
                                        </div>
                                    )}

                                    {/* Upload Action */}
                                    <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            accept=".json,.html"
                                            className="hidden"
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--primary-color)] hover:bg-[var(--primary-color)]/5 flex flex-col items-center justify-center gap-2 group transition-all"
                                        >
                                            <Upload className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--primary-color)] transition-colors" />
                                            <div className="text-center">
                                                <div className="text-sm font-medium text-[var(--text-primary)]">
                                                    Upload Backup or Bookmarks
                                                </div>
                                                <div className="text-[10px] text-[var(--text-tertiary)]">
                                                    Supports .json and .html files
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
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

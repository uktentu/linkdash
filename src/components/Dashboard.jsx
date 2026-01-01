import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Search, Plus, ExternalLink, LayoutGrid, List, Cloud, LogIn, Settings, ArrowLeft, X, Download, Share2, Users, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { CategoryCard } from './CategoryCard';
import { TeamCard } from './TeamCard';
import { Tooltip } from './Tooltip';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';

export function Dashboard({
    categories,
    teams = [], // New prop
    onAddCategory,
    onEditCategory,
    onDeleteCategory,
    onAddUrl,
    onEditUrl,
    onDeleteUrl,
    onDeleteTeam, // New prop
    onOpenCreateTeam, // New prop
    onOpenJoinTeam, // New prop
    syncState, // New prop
    onEnableSync, // New prop
    onRecoverAccount, // Restored prop
    onPullFromCloud, // Manual refresh prop
    onDisconnect, // New prop
    onIncrementClick, // New prop
    onOpenSettings, // New prop
    reorderCategories, // New prop
    onTogglePin, // New prop for pin toggle
    onToggleCollapse, // New prop for collapse toggle
    linkLayout // New prop
}) {
    const [viewMode] = useState('grid');
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const [viewingTeam, setViewingTeam] = useState(null); // ID of team being viewed
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMode, setActiveMode] = useState('all'); // 'all', 'work', 'personal'
    const [activeId, setActiveId] = useState(null); // For DragOverlay

    // Responsive Column Logic
    const [numCols, setNumCols] = useState(() => {
        if (typeof window === 'undefined') return 1;
        const width = window.innerWidth;
        if (width >= 1536) return 4;
        if (width >= 1280) return 3;
        if (width >= 768) return 2;
        return 1;
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width >= 1536) setNumCols(4); // 2xl
            else if (width >= 1280) setNumCols(3); // xl
            else if (width >= 768) setNumCols(2); // md
            else setNumCols(1);
        };

        handleResize(); // Init
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // If viewing a team, we show THAT team's categories
    // `viewingTeam` object is retrieved from `teams` array
    const activeTeam = viewingTeam ? teams.find(t => t.id === viewingTeam) : null;
    const baseCategories = activeTeam ? activeTeam.categories : categories;

    // Handlers need to be disabled or modified in Team View (Read-only for now?)
    // Requirement says "import dashboard to their end, and in a seperate tile it will show those imported dashboards"
    // Usually imported dashboards are read-only to prevent drift, or they are local copies?
    // User didn't specify. Assuming "Local Copy" behavior for now, but `joinTeam` created new IDs, so they are editable independent copies! 
    // Wait, if I edit the team dashboard, does it affect the original? No, it's a code share.
    // So they are fully editable local copies under a "Team" container.

    // We need to route editing actions correctly.
    // BUT `useLocalStorage` structure for teams is: `teams: [{ id, name, categories: [] }]`
    // My hook doesn't have `updateTeamCategory` functions yet. 
    // For MVP, I will make Team Dashboards READ-ONLY or simply allow viewing.
    // Use `CategoryCard` but maybe hide add/edit buttons if it's too complex to implement nested state updates right now?
    // "Create a team... import... show imported dashboards".
    // I will make them READ-ONLY for safety, or just standard view.
    // If I want to edit, I need `updateTeamUrl` etc in the hook.
    // I'll stick to Read-Only for the "imported" view to simplify, OR just allow clicking links.

    const isReadOnly = !!activeTeam;

    // Mode Filtering
    const modeFilteredCategories = baseCategories.filter(cat => {
        if (activeMode === 'all') return true;
        return cat.mode === activeMode || cat.mode === 'neutral' || !cat.mode;
    });

    // Search Filtering
    const filteredCategories = modeFilteredCategories.map(cat => {
        // 1. Check if category name matches
        const nameMatch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());

        // 2. Filter URLs that match
        const matchingUrls = cat.urls.filter(url =>
            url.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            url.url.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // 3. Return category if name matches (with all URLs? or filtered URLs?)
        // Decision: If name matches, show all? No, probably useful to still filter URLs if query is specific.
        // Better UX: Show category if name matches OR if it has matching URLs.
        // If name matches, maybe show all URLs? Or just matching?
        // Let's stick to "Filter URLs match" + "Include if Category Name match".
        // If Category name matches, we probably want to see the content.
        // Let's go with: Show filtered URLs. If category name matches but 0 urls match, show empty?
        // Actually, widespread pattern: if Category matches, show all URLs. If Category doesn't, show matching URLs.

        if (nameMatch) {
            return { ...cat }; // Show all (but maybe this is too noisy if I search "Dev" and get 100 links?)
            // Let's stick to strict filtering: only show what matches.
            // Exception: If I search "Social", I want to see the "Social" folder links.
            // So: IF nameMatch => return all. matchUrls = cat.urls
        }

        return {
            ...cat,
            urls: matchingUrls
        };
    }).filter(cat =>
        // Keep category if name matched (urls might be empty if we returned early above, wait. if nameMatch we returned cat, so urls is original full list)
        // OR if it has matching URLs.
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) || cat.urls.length > 0
    );



    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            reorderCategories(active.id, over.id);
        }
        setActiveId(null);
    };

    return (
        <div className="w-full">
            {/* Sticky Glass Header */}
            {/* Top Bar with Branding & Search */}
            <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-2xl border-b border-[var(--border-subtle)] transition-all duration-300 supports-[backdrop-filter]:bg-black/20">
                <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">

                    {/* Mobile Search Overlay */}
                    <AnimatePresence>
                        {isMobileSearchOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute inset-0 z-50 bg-[var(--bg-card)] flex items-center px-4 gap-3 md:hidden"
                            >
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                                        <Search className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search..."
                                        autoFocus
                                        className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-[var(--primary-500)] focus:ring-1 focus:ring-[var(--primary-500)] text-sm outline-none"
                                    />
                                </div>
                                <button
                                    onClick={() => { setIsMobileSearchOpen(false); setSearchQuery(''); }}
                                    className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Left: Branding & Team Nav */}
                    <div className={`flex items-center gap-3 transition-opacity duration-200 ${isMobileSearchOpen ? 'opacity-0 md:opacity-100' : 'opacity-100'} min-w-0 md:min-w-[240px]`}>
                        {activeTeam ? (
                            <motion.button
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={() => setViewingTeam(null)}
                                className="group flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                <span className="text-sm font-medium hidden sm:block">Back</span>
                            </motion.button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-[var(--primary-500)] flex items-center justify-center shadow-lg shadow-[var(--primary-500)]/20 shrink-0">
                                    <LayoutGrid className="w-4 h-4 text-[var(--text-on-primary)]" />
                                </div>
                                <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)] hidden sm:block">
                                    Link<span className="text-[var(--text-secondary)]">Dash</span>
                                </h1>
                            </div>
                        )}
                        {activeTeam && (
                            <div className="h-4 w-px bg-[var(--border-subtle)] mx-2 hidden sm:block" />
                        )}
                        {activeTeam && (
                            <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)] truncate">
                                {activeTeam.name}
                            </h1>
                        )}
                    </div>

                    {/* Center: Search Bar - Wider and more distinct */}
                    <div className="flex-1 max-w-2xl hidden md:block">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-tertiary)] group-focus-within:text-[var(--primary-500)] transition-colors">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search links, commands, or teams (Cmd+K)..."
                                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[var(--bg-input)]/50 border border-[var(--border-subtle)] hover:border-[var(--border-hover)] focus:border-[var(--primary-500)]/50 focus:bg-[var(--bg-card)] focus:ring-4 focus:ring-[var(--primary-500)]/10 transition-all text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 font-sans text-[10px] font-medium text-[var(--text-tertiary)] opacity-50 bg-transparent border-none shadow-none ring-0">
                                    <span className="text-xs">⌘</span>K
                                </kbd>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className={`flex items-center justify-end gap-2 md:gap-3 transition-opacity duration-200 ${isMobileSearchOpen ? 'opacity-0 md:opacity-100' : 'opacity-100'} min-w-0 md:min-w-[240px]`}>

                        {/* Mobile Search Toggle */}
                        <button
                            onClick={() => setIsMobileSearchOpen(true)}
                            className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        {/* Focus Mode - Improved Toggle */}
                        <div className="hidden xl:flex items-center p-1 rounded-xl bg-[var(--bg-input)]/50 border border-[var(--border-subtle)]">
                            {['all', 'work', 'personal'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setActiveMode(mode)}
                                    className={`px-3 py-1.5 rounded-[8px] text-[11px] font-semibold uppercase tracking-wider transition-all ${activeMode === mode
                                        ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm ring-1 ring-white/5'
                                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]/50'
                                        }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-6 bg-[var(--border-subtle)] hidden xl:block" />

                        {/* Team Actions */}
                        {!activeTeam && (
                            <div className="flex items-center gap-1">
                                <Tooltip content="Join an existing team">
                                    <button
                                        onClick={onOpenJoinTeam}
                                        className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                                        title="Join Team"
                                    >
                                        <LogIn className="w-4 h-4" />
                                    </button>
                                </Tooltip>
                                <Tooltip content="Create a new team">
                                    <button
                                        onClick={onOpenCreateTeam}
                                        className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                                        title="Create Team"
                                    >
                                        <Users className="w-4 h-4" />
                                    </button>
                                </Tooltip>
                            </div>
                        )}

                        {/* Sync Status */}
                        {!activeTeam && (
                            syncState?.status === 'synced' ? (
                                <div className="flex items-center gap-1">
                                    <Tooltip content="Refresh from Cloud">
                                        <button
                                            onClick={onPullFromCloud}
                                            className="h-9 w-9 flex items-center justify-center rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all"
                                            title="Refresh from Cloud"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </Tooltip>
                                    <Tooltip content="Synced (Click to Disconnect)">
                                        <button
                                            onClick={onDisconnect}
                                            className="h-9 w-9 flex items-center justify-center rounded-lg text-green-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
                                            title="Synced (Click to Disconnect)"
                                        >
                                            <Cloud className="w-4 h-4 group-hover:hidden" />
                                            <X className="w-4 h-4 hidden group-hover:block" />
                                        </button>
                                    </Tooltip>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1">
                                    <Tooltip content="Enable Cloud Sync">
                                        <button
                                            onClick={onEnableSync}
                                            className="h-9 w-9 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
                                            title="Enable Cloud Sync"
                                        >
                                            <Cloud className="w-4 h-4" />
                                        </button>
                                    </Tooltip>
                                    <Tooltip content="Recover Data">
                                        <button
                                            onClick={onRecoverAccount}
                                            className="h-9 w-9 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all"
                                            title="Recover Data"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </Tooltip>
                                </div>
                            )
                        )}

                        {/* Settings */}
                        <Tooltip content="Dashboard Settings">
                            <button
                                onClick={onOpenSettings}
                                className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                                title="Settings"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                        </Tooltip>

                        {/* Add Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={activeTeam ? undefined : onAddCategory}
                            disabled={isReadOnly}
                            className={`ml-2 h-9 px-4 rounded-xl bg-[var(--primary-500)] text-[var(--text-on-primary)] text-sm font-semibold shadow-lg shadow-[var(--primary-500)]/20 flex items-center gap-2 border border-white/10 ${activeTeam ? 'opacity-50 grayscale' : 'hover:brightness-110'}`}
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">New</span>
                        </motion.button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8 space-y-12">

                {/* Teams Section (Only on Root and NOT searching) */}
                {!activeTeam && !searchQuery && teams.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-4 text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                            <Users className="w-4 h-4" /> Joined Teams
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {teams.map(team => (
                                <TeamCard
                                    key={team.id}
                                    team={team}
                                    onView={() => setViewingTeam(team.id)}
                                    onDelete={() => onDeleteTeam(team.id)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Categories Section */}
                <section>
                    {!activeTeam && teams.length > 0 && !searchQuery && (
                        <div className="flex items-center gap-2 mb-4 text-sm font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                            <LayoutGrid className="w-4 h-4" /> My Collections
                        </div>
                    )}

                    {!activeTeam ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={filteredCategories.filter(c => !c.pinned).map(c => c.id)}
                                strategy={rectSortingStrategy}
                            >
                                <motion.div
                                    layout
                                    className={`flex gap-6 items-start ${viewMode === 'grid' ? '' : 'max-w-4xl mx-auto'
                                        }`}
                                >
                                    {Array.from({ length: numCols }).map((_, colIndex) => (
                                        <div key={colIndex} className="flex-1 flex flex-col gap-6">
                                            <AnimatePresence mode="popLayout">
                                                {filteredCategories
                                                    .map((cat, originalIndex) => ({ ...cat, originalIndex }))
                                                    .filter((_, index) => index % numCols === colIndex)
                                                    .map((category) => (
                                                        <motion.div
                                                            key={category.id}
                                                            layout
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, scale: 0.9 }}
                                                            transition={{ duration: 0.3, delay: category.originalIndex * 0.05 }}
                                                            className="break-inside-avoid"
                                                        >
                                                            <CategoryCard
                                                                category={category}
                                                                viewMode={viewMode}
                                                                onEdit={() => onEditCategory(category)}
                                                                onDelete={() => onDeleteCategory(category.id)}
                                                                onAddUrl={() => onAddUrl(category.id)}
                                                                onEditUrl={(url) => onEditUrl(category.id, url)}
                                                                onDeleteUrl={(urlId) => onDeleteUrl(category.id, urlId)}
                                                                onTogglePin={() => onTogglePin(category.id)}
                                                                onToggleCollapse={() => onToggleCollapse(category.id)}
                                                                isReadOnly={false}
                                                                onIncrementClick={onIncrementClick}
                                                                linkLayout={linkLayout}
                                                            />
                                                        </motion.div>
                                                    ))}
                                            </AnimatePresence>
                                        </div>
                                    ))}

                                    {/* Empty State rendered once outside or handled per col? 
                                        If filteredCategories is 0, nothing renders in cols.
                                        We need to check filteredCategories.length outside.
                                    */}
                                </motion.div>
                                {filteredCategories.length === 0 && (
                                    <div className="w-full" style={{ columnSpan: 'all' }}>
                                        <div className="flex flex-col items-center justify-center py-32 text-[var(--text-tertiary)]">
                                            <Search className="w-12 h-12 mb-4 opacity-30" />
                                            <p className="text-lg font-medium">
                                                {searchQuery ? `No matches for "${searchQuery}"` : "No collections found"}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </SortableContext>

                            <DragOverlay>
                                {activeId ? (
                                    <div className="opacity-90 scale-105 cursor-grabbing">
                                        <CategoryCard
                                            category={categories.find(c => c.id === activeId)}
                                            viewMode={viewMode}
                                            isReadOnly={true}
                                        />
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    ) : (
                        // Read-Only Team View
                        <div className={`grid gap-6 ${viewMode === 'grid'
                            ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
                            : 'grid-cols-1 max-w-4xl mx-auto'
                            }`}>
                            {filteredCategories.map((category) => (
                                <CategoryCard
                                    key={category.id}
                                    category={category}
                                    viewMode={viewMode}
                                    isReadOnly={true}
                                    onIncrementClick={onIncrementClick}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}


import { useState, useEffect } from 'react';

const STORAGE_KEY = 'url-dashboard-data';

const defaultData = {
    categories: [],
    teams: [],
    theme: 'theme-white',
    pattern: 'dots', // 'dots', 'grid', 'none'
    linkLayout: 'list' // 'list', 'grid'
};

export function useLocalStorage() {
    const [data, setData] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : defaultData;
        } catch {
            return defaultData;
        }
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }, 500); // Debounce writes to avoid UI stutter on typing/drag
        return () => clearTimeout(handler);
    }, [data]);

    const updateTheme = (updates) => {
        setData(prev => ({ ...prev, ...updates }));
    };

    const addCategory = (name, mode = 'neutral') => {
        const newCategory = {
            id: crypto.randomUUID(),
            name,
            mode, // 'neutral', 'work', 'personal'
            urls: []
        };
        setData(prev => ({
            ...prev,
            categories: [...prev.categories, newCategory]
        }));
    };



    const updateCategory = (id, name, mode = 'neutral') => {
        setData(prev => ({
            ...prev,
            categories: prev.categories.map(cat =>
                cat.id === id ? { ...cat, name, mode } : cat
            )
        }));
    };

    const deleteCategory = (id) => {
        setData(prev => ({
            ...prev,
            categories: prev.categories.filter(cat => cat.id !== id)
        }));
    };

    const togglePinCategory = (id) => {
        setData(prev => ({
            ...prev,
            categories: prev.categories.map(cat =>
                cat.id === id ? { ...cat, pinned: !cat.pinned } : cat
            )
        }));
    };

    const toggleCategoryCollapse = (id) => {
        setData(prev => ({
            ...prev,
            categories: prev.categories.map(cat =>
                cat.id === id ? { ...cat, isCollapsed: !cat.isCollapsed } : cat
            )
        }));
    };

    const reorderCategories = (activeId, overId) => {
        setData(prev => {
            const categories = prev.categories || [];
            const activeItem = categories.find(c => c.id === activeId);
            const overItem = categories.find(c => c.id === overId);

            if (!activeItem || !overItem || activeItem.pinned || overItem.pinned) return prev;

            const oldIndex = categories.findIndex(c => c.id === activeId);
            const newIndex = categories.findIndex(c => c.id === overId);

            if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev;

            // Simple swap for now, but respecting pinned items as anchors
            const newCategories = [...categories];
            const [movedItem] = newCategories.splice(oldIndex, 1);
            newCategories.splice(newIndex, 0, movedItem);

            // Re-verify that pinned items are still at their original absolute positions if possible
            // Actually, the above splice logic will displace them. 
            // Let's use the anchor logic:

            const pinnedIndices = categories.map((c, i) => c.pinned ? i : -1).filter(i => i !== -1);
            const pinnedItems = pinnedIndices.map(i => categories[i]);
            const unpinnedItems = categories.filter(c => !c.pinned);

            const unpinnedOldIndex = unpinnedItems.findIndex(c => c.id === activeId);
            const unpinnedNewIndex = unpinnedItems.findIndex(c => c.id === overId);

            if (unpinnedOldIndex !== -1 && unpinnedNewIndex !== -1) {
                const reorderedUnpinned = [...unpinnedItems];
                const [item] = reorderedUnpinned.splice(unpinnedOldIndex, 1);
                reorderedUnpinned.splice(unpinnedNewIndex, 0, item);

                // Merge back
                const finalCategories = [];
                let unpinnedPtr = 0;
                for (let i = 0; i < categories.length; i++) {
                    const pinnedItemAtThisIndex = pinnedItems.find((_, pIdx) => pinnedIndices[pIdx] === i);
                    if (pinnedItemAtThisIndex) {
                        finalCategories.push(pinnedItemAtThisIndex);
                    } else {
                        finalCategories.push(reorderedUnpinned[unpinnedPtr++]);
                    }
                }

                return { ...prev, categories: finalCategories };
            }

            return prev;
        });
    };

    const addUrl = (categoryId, title, url, customFavicon = null) => {
        const newUrl = {
            id: crypto.randomUUID(),
            title,
            url,
            customFavicon
        };
        setData(prev => ({
            ...prev,
            categories: prev.categories.map(cat =>
                cat.id === categoryId
                    ? { ...cat, urls: [...cat.urls, newUrl] }
                    : cat
            )
        }));
    };

    const updateUrl = (categoryId, urlId, title, url, customFavicon = null) => {
        setData(prev => ({
            ...prev,
            categories: prev.categories.map(cat =>
                cat.id === categoryId
                    ? {
                        ...cat,
                        urls: cat.urls.map(u =>
                            u.id === urlId ? { ...u, title, url, customFavicon } : u
                        )
                    }
                    : cat
            )
        }));
    };

    const deleteUrl = (categoryId, urlId) => {
        setData(prev => ({
            ...prev,
            categories: prev.categories.map(cat =>
                cat.id === categoryId
                    ? { ...cat, urls: cat.urls.filter(u => u.id !== urlId) }
                    : cat
            )
        }));
    };

    const incrementUrlClick = (categoryId, urlId) => {
        setData(prev => ({
            ...prev,
            categories: prev.categories.map(cat =>
                cat.id === categoryId
                    ? {
                        ...cat,
                        urls: cat.urls.map(u =>
                            u.id === urlId ? { ...u, clickCount: (u.clickCount || 0) + 1 } : u
                        )
                    }
                    : cat
            )
        }));
    };

    const joinTeam = (teamObj) => {
        const newTeam = {
            id: crypto.randomUUID(),
            name: teamObj.name,
            categories: teamObj.categories.map(cat => ({
                ...cat,
                id: crypto.randomUUID(),
                urls: cat.urls.map(url => ({ ...url, id: crypto.randomUUID() }))
            })),
            joinedAt: new Date().toISOString()
        };

        setData(prev => ({
            ...prev,
            teams: [...(prev.teams || []), newTeam]
        }));
    };

    const deleteTeam = (teamId) => {
        setData(prev => ({
            ...prev,
            teams: (prev.teams || []).filter(t => t.id !== teamId)
        }));
    };

    const importData = (newData) => {
        // Validate structure briefly
        if (newData && Array.isArray(newData.categories)) {
            setData({
                categories: newData.categories,
                teams: newData.teams || [],
                // Include UI settings
                linkLayout: newData.linkLayout || data.linkLayout || 'list',
                theme: newData.theme || data.theme || 'theme-white',
                pattern: newData.pattern || data.pattern || 'dots'
            });
            return true;
        }
        return false;
    };

    return {
        categories: data.categories,
        teams: data.teams || [],
        data, // Expose full object for sync
        addCategory,
        updateCategory,
        deleteCategory,
        addUrl,
        updateUrl,
        deleteUrl,
        incrementUrlClick, // Expose
        joinTeam,
        deleteTeam,
        importData, // Expose import function
        updateTheme, // Expose theme updater
        reorderCategories, // Expose
        togglePinCategory, // Expose pin toggle
        toggleCategoryCollapse, // Expose collapse toggle
        theme: data.theme || 'theme-white',
        pattern: data.pattern || 'dots'
    };
}

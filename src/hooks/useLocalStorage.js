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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

    const reorderCategories = (activeId, overId) => {
        setData(prev => {
            const oldIndex = prev.categories.findIndex(c => c.id === activeId);
            const newIndex = prev.categories.findIndex(c => c.id === overId);

            if (oldIndex === -1 || newIndex === -1) return prev;

            const newCategories = [...prev.categories];
            const [movedItem] = newCategories.splice(oldIndex, 1);
            newCategories.splice(newIndex, 0, movedItem);

            return {
                ...prev,
                categories: newCategories
            };
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
                teams: newData.teams || []
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
        theme: data.theme || 'theme-indigo',
        pattern: data.pattern || 'dots'
    };
}

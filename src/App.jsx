import { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useCloudSync } from './hooks/useCloudSync';
import { Dashboard } from './components/Dashboard';
import { AddCategoryModal, AddUrlModal, ConfirmationModal } from './components/Modal';
import { CreateTeamModal, JoinTeamModal } from './components/TeamModals';
import { EnableSyncModal, RecoverAccountModal } from './components/SyncModals';
import { CommandPalette } from './components/CommandPalette';
import { SettingsModal } from './components/SettingsModal';
import './index.css';

function App() {
  const {
    categories,
    teams,
    data: localData, // Full data object for sync
    addCategory,
    updateCategory,
    deleteCategory,
    addUrl,
    updateUrl,
    deleteUrl,
    incrementUrlClick,
    joinTeam,
    deleteTeam,
    importData,
    updateTheme, // New
    reorderCategories, // New
    togglePinCategory, // New
    toggleCategoryCollapse // New
  } = useLocalStorage();

  // Cloud Sync Hook
  const { syncState, enableSync, recoverAccount, pullFromCloud, disconnect } = useCloudSync(localData, importData);

  // Modal states
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [urlModalOpen, setUrlModalOpen] = useState(false);
  const [urlModalCategoryId, setUrlModalCategoryId] = useState(null);
  const [editingUrl, setEditingUrl] = useState(null);
  const [prefillUrl, setPrefillUrl] = useState(''); // New state

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', action: () => { } });

  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [joinTeamOpen, setJoinTeamOpen] = useState(false);

  // Sync Modals
  const [enableSyncOpen, setEnableSyncOpen] = useState(false);
  const [recoverAccountOpen, setRecoverAccountOpen] = useState(false);

  // Command Palette
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Settings
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = (name, mode) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, name, mode);
    } else {
      addCategory(name, mode);
    }
  };

  const handleDeleteCategory = (categoryId) => {
    setConfirmConfig({
      title: 'Delete Collection?',
      message: 'This will permanently delete this collection and all the links inside it. This action cannot be undone.',
      action: () => deleteCategory(categoryId)
    });
    setConfirmOpen(true);
  };

  // URL handlers
  const handleAddUrl = (categoryId, url = '') => {
    setUrlModalCategoryId(categoryId);
    setEditingUrl(null);
    setPrefillUrl(url); // Set prefill
    setUrlModalOpen(true);
  };

  const handleEditUrl = (categoryId, url) => {
    setUrlModalCategoryId(categoryId);
    setEditingUrl(url);
    setUrlModalOpen(true);
  };

  const handleUrlSubmit = (title, url, customFavicon) => {
    if (editingUrl) {
      updateUrl(urlModalCategoryId, editingUrl.id, title, url, customFavicon);
    } else {
      addUrl(urlModalCategoryId, title, url, customFavicon);
    }
  };

  const handleDeleteUrl = (categoryId, urlId) => {
    setConfirmConfig({
      title: 'Delete Link?',
      message: 'Are you sure you want to remove this link from your collection?',
      action: () => deleteUrl(categoryId, urlId)
    });
    setConfirmOpen(true);
  };

  const handleJoinTeam = (teamObj) => {
    joinTeam(teamObj);
  };

  const handleDeleteTeam = (teamId) => {
    setConfirmConfig({
      title: 'Delete Team Dashboard?',
      message: 'This will remove the team dashboard from your view. You can re-join later if you have the code.',
      action: () => deleteTeam(teamId)
    });
    setConfirmOpen(true);
  };

  const handleDisconnect = () => {
    setConfirmConfig({
      title: 'Disconnect Cloud Sync?',
      message: 'This will stop backing up your data to the cloud. Your local data will remain safe.',
      action: disconnect,
      actionLabel: 'Disconnect'
    });
    setConfirmOpen(true);
  };

  const urlModalCategory = categories.find(c => c.id === urlModalCategoryId);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${localData.theme || 'theme-white'}`}>
      <main className="flex-grow">
        <Dashboard
          categories={categories}
          teams={teams}
          syncState={syncState} // Pass sync state
          onAddCategory={handleAddCategory}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onAddUrl={handleAddUrl}
          onEditUrl={handleEditUrl}
          onDeleteUrl={handleDeleteUrl}
          onDeleteTeam={handleDeleteTeam}
          onOpenCreateTeam={() => setCreateTeamOpen(true)}
          onOpenJoinTeam={() => setJoinTeamOpen(true)}
          onEnableSync={() => setEnableSyncOpen(true)} // Open sync modal
          onRecoverAccount={() => setRecoverAccountOpen(true)} // Open recover modal
          onPullFromCloud={pullFromCloud} // Manual refresh
          onDisconnect={handleDisconnect} // Show confirmation first
          onIncrementClick={incrementUrlClick}
          onOpenSettings={() => setSettingsOpen(true)}
          reorderCategories={reorderCategories} // Pass reorder function
          onTogglePin={togglePinCategory} // Pass pin toggle
          onToggleCollapse={toggleCategoryCollapse} // Pass collapse toggle
          linkLayout={localData.linkLayout || 'list'} // Pass link layout preference
        />
      </main>

      {/* Developer Footer */}
      <footer className="py-8 text-center text-sm text-[var(--text-tertiary)] opacity-60 hover:opacity-100 transition-opacity">
        <p>&copy; {new Date().getFullYear()} Uday Kiran Tentu. All rights reserved.</p>
      </footer>

      {/* Modals */}
      <AddCategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSubmit={handleCategorySubmit}
        editData={editingCategory}
      />

      <AddUrlModal
        isOpen={urlModalOpen}
        onClose={() => setUrlModalOpen(false)}
        onSubmit={handleUrlSubmit}
        editData={editingUrl}
        prefillUrl={prefillUrl} // Pass it
        categoryName={urlModalCategory?.name || ''}
      />

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmConfig.action}
        title={confirmConfig.title}
        message={confirmConfig.message}
        actionLabel={confirmConfig.actionLabel} // Pass custom label
      />

      <CreateTeamModal
        isOpen={createTeamOpen}
        onClose={() => setCreateTeamOpen(false)}
        categories={categories}
      />

      <JoinTeamModal
        isOpen={joinTeamOpen}
        onClose={() => setJoinTeamOpen(false)}
        onJoin={handleJoinTeam}
      />

      <EnableSyncModal
        isOpen={enableSyncOpen}
        onClose={() => setEnableSyncOpen(false)}
        onEnable={enableSync}
      />

      <RecoverAccountModal
        isOpen={recoverAccountOpen}
        onClose={() => setRecoverAccountOpen(false)}
        onRecover={recoverAccount}
      />

      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        categories={categories}
        teams={teams}
        onIncrementClick={incrementUrlClick}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        currentTheme={localData.theme || 'theme-white'}
        currentPattern={localData.pattern || 'dots'}
        currentLinkLayout={localData.linkLayout || 'list'} // Pass this
        onUpdate={updateTheme}
      />

      {/* Dynamic Background Pattern */}
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        backgroundImage: (localData.pattern === 'dots' || !localData.pattern)
          ? 'radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)'
          : localData.pattern === 'grid'
            ? 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)'
            : 'none',
        backgroundSize: (localData.pattern === 'grid') ? '40px 40px' : '24px 24px'
      }} />
    </div>
  );
}

export default App;

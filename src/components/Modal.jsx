import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { X, Globe, Link, Type, FolderPlus, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';

// Animation variants for modal
const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
};

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: "spring", damping: 30, stiffness: 300 }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: 10,
        transition: { duration: 0.15 }
    }
};

export function Modal({ isOpen, onClose, title, children }) {
    useEffect(() => {
        const handleEsc = (e) => e.key === 'Escape' && onClose();
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative w-full max-w-md glass-panel rounded-2xl shadow-2xl overflow-hidden bg-[#09090b]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
                            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                            <div className="flex items-center gap-2">
                                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-[var(--text-tertiary)] border border-[var(--border-subtle)] px-1.5 py-0.5 rounded font-mono">
                                    ESC
                                </span>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-md hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export function AddCategoryModal({ isOpen, onClose, onSubmit, editData }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Rename Collection' : 'New Collection'}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.target);
                    const name = fd.get('name').toString().trim();
                    const mode = fd.get('mode').toString();
                    if (name) {
                        onSubmit(name, mode);
                        onClose();
                    }
                }}
                className="flex flex-col gap-5"
            >
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                            Collection Name
                        </label>
                        <input
                            name="name"
                            defaultValue={editData?.name}
                            placeholder="e.g. Development..."
                            className="input-minimal w-full px-4 py-3 rounded-xl text-sm"
                            autoFocus
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                            Focus Mode
                        </label>
                        <div className="flex gap-2">
                            {['neutral', 'work', 'personal'].map(mode => (
                                <label key={mode} className="flex-1 cursor-pointer">
                                    <input type="radio" name="mode" value={mode} defaultChecked={editData ? editData.mode === mode : mode === 'neutral'} className="hidden peer" />
                                    <div className="h-10 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-input)] flex items-center justify-center text-sm capitalize text-[var(--text-secondary)] peer-checked:bg-[var(--text-primary)] peer-checked:text-[var(--bg-main)] peer-checked:font-semibold transition-all hover:bg-[var(--bg-card-hover)]">
                                        {mode}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-white/10"
                    >
                        {editData ? 'Save Changes' : 'Create Collection'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export function AddUrlModal({ isOpen, onClose, onSubmit, editData, categoryName, prefillUrl = '' }) {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [customFavicon, setCustomFavicon] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (editData) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setTitle(editData.title);
                setUrl(editData.url);
                setCustomFavicon(editData.customFavicon || '');
            } else {
                setTitle('');
                setUrl(prefillUrl || '');
                setCustomFavicon('');

                // Auto-title from URL if prefilled
                if (prefillUrl) {
                    try {
                        const hostname = new URL(prefillUrl).hostname;
                        setTitle(hostname.replace('www.', ''));
                        // eslint-disable-next-line no-empty
                    } catch { }
                }
            }
        }
    }, [isOpen, editData, prefillUrl]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Link' : `Add to ${categoryName}`}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.target);
                    const submittedTitle = fd.get('title').toString().trim();
                    let submittedUrl = fd.get('url').toString().trim();
                    const submittedCustomFavicon = fd.get('customFavicon').toString().trim() || null;

                    if (!submittedUrl.match(/^https?:\/\//)) submittedUrl = 'https://' + submittedUrl;

                    if (submittedTitle && submittedUrl) {
                        onSubmit(submittedTitle, submittedUrl, submittedCustomFavicon);
                        onClose();
                    }
                }}
                className="flex flex-col gap-5"
            >
                <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Title</label>
                    <input
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. GitHub Repository"
                        className="input-minimal w-full px-4 py-3 rounded-xl text-sm"
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">URL</label>
                    <input
                        name="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="input-minimal w-full px-4 py-3 rounded-xl text-sm font-mono text-[var(--text-tertiary)] focus:text-[var(--text-primary)]"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Icon URL <span className="text-[var(--text-tertiary)] lowercase font-normal">(optional)</span></label>
                    <input
                        name="customFavicon"
                        value={customFavicon}
                        onChange={(e) => setCustomFavicon(e.target.value)}
                        placeholder="https://example.com/icon.png"
                        className="input-minimal w-full px-4 py-3 rounded-xl text-sm font-mono text-[var(--text-tertiary)] focus:text-[var(--text-primary)]"
                    />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-white/10"
                    >
                        {editData ? 'Save Changes' : 'Add Link'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
export function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, actionLabel = 'Delete' }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col gap-6">
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {message}
                </p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="btn-primary px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-red-500/10 bg-red-600 hover:bg-red-500 text-white border-none"
                        style={{ background: '#dc2626', color: 'white' }}
                    >
                        {actionLabel}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

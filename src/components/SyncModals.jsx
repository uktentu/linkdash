import { useState } from 'react';
import { X, Copy, Check, Download, Cloud, Key, AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from './Modal';

// 1. Enable Sync Modal (Show Key)
export function EnableSyncModal({ isOpen, onClose, onEnable }) {
    const [step, setStep] = useState(1); // 1: Info, 2: Key Display
    const [key, setKey] = useState('');
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEnable = async () => {
        setIsLoading(true);
        setError('');
        try {
            const secretKey = await onEnable();
            setKey(secretKey);
            setStep(2);
        } catch {
            setError('Failed to enable sync. Please check your network.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={step === 1 ? "Enable Cloud Sync" : "Save Your Secret Key"}>
            {step === 1 ? (
                <div className="space-y-6">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-start gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                            <Cloud className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-indigo-200">Zero-Knowledge Sync</h4>
                            <p className="text-sm text-indigo-200/70 mt-1">
                                Your data is uniquely encrypted on your device. We cannot see it, and no one can access it without your key.
                            </p>
                        </div>
                    </div>

                    <p className="text-sm text-[var(--text-secondary)]">
                        We will generate a **Secret Recovery Key** for you. This key is your only way to access your data on other devices. If you lose it, your data cannot be recovered.
                    </p>

                    <div className="flex justify-end gap-3 pt-2">
                        <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Cancel</button>
                        <button
                            onClick={handleEnable}
                            disabled={isLoading}
                            className="btn-primary px-6 py-2.5 rounded-xl text-sm flex items-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Key & Sync'}
                        </button>
                    </div>
                    {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                        <p className="text-sm text-red-200/80">
                            <strong className="text-red-200">IMPORTANT:</strong> Save this key securely! We do not store it. If you lose it, you lose access.
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                            Your Secret Recovery Key
                        </label>
                        <div
                            onClick={handleCopy}
                            className="bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl p-4 cursor-pointer hover:border-[var(--text-secondary)] transition-colors group relative"
                        >
                            <code className="text-lg font-mono text-[var(--text-primary)] break-all">{key}</code>
                            <div className="absolute top-2 right-2 p-2 rounded-lg bg-[var(--bg-card)] text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity">
                                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="btn-primary px-6 py-2.5 rounded-xl text-sm"
                        >
                            I have saved my key
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}

// 2. Recover Modal
export function RecoverAccountModal({ isOpen, onClose, onRecover }) {
    const [key, setKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!key.trim()) return;

        setIsLoading(true);
        setError('');

        try {
            const success = await onRecover(key.trim());
            if (success) {
                onClose();
            } else {
                setError('Invalid key or no data found.');
            }
        } catch {
            setError('Recovery failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Recover Account">
            <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-sm text-[var(--text-secondary)]">
                    Enter your Secret Recovery Key to decrypt and restore your dashboard. This will overwrite any current data.
                </p>

                <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                        Secret Key
                    </label>
                    <textarea
                        value={key}
                        onChange={(e) => { setKey(e.target.value); setError(''); }}
                        placeholder="Paste your key here..."
                        className="input-minimal w-full px-4 py-3 rounded-xl text-sm font-mono min-h-[100px] resize-none"
                        autoFocus
                    />
                    {error && <p className="text-red-400 text-xs mt-2 flex items-center gap-1">{error}</p>}
                </div>

                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Cancel</button>
                    <button
                        type="submit"
                        disabled={!key || isLoading}
                        className="btn-primary px-6 py-2.5 rounded-xl text-sm disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Decrypt & Restore'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

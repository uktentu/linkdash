import { useState } from 'react';
import { encodeTeam, decodeTeam } from '../utils/teamUtils';
import { teamStorage } from '../services/firebase';
import { Modal } from './Modal';
import { Copy, Check, Lock, Users, ArrowRight, Download, Cloud } from 'lucide-react';

export function CreateTeamModal({ isOpen, onClose, categories }) {
    const [step, setStep] = useState(1); // 1: Select, 2: Code
    const [selectedIds, setSelectedIds] = useState([]);
    const [teamName, setTeamName] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isCloudCode, setIsCloudCode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = () => {
        if (!teamName || selectedIds.length === 0) return;

        const teamData = {
            name: teamName,
            categories: categories.filter(c => selectedIds.includes(c.id))
        };

        const code = encodeTeam(teamData);
        setGeneratedCode(code);
        setIsCloudCode(false);
        setStep(2);
    };

    const handleGenerateCloud = async () => {
        if (!teamName || selectedIds.length === 0) return;
        setLoading(true);
        try {
            const teamData = {
                name: teamName,
                categories: categories.filter(c => selectedIds.includes(c.id))
            };
            const code = await teamStorage.saveTeam(teamData);
            setGeneratedCode(code);
            setIsCloudCode(true);
            setStep(2);
        } catch (e) {
            if (e.code === 'permission-denied') {
                alert("Permission Denied: You need to update your Firestore Security Rules to allow 'shared_teams'.");
            } else {
                alert("Failed to generate cloud code. Please check your connection.");
            }
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelection = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const reset = () => {
        setStep(1);
        setSelectedIds([]);
        setTeamName('');
        setGeneratedCode('');
        setIsCloudCode(false);
        setCopied(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={reset} title={step === 1 ? "Create Team Dashboard" : (isCloudCode ? "Easy Share Code" : "Share Team Code")}>
            {step === 1 ? (
                <div className="flex flex-col gap-6">
                    <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">Team Name</label>
                        <input
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="e.g. Engineering Team"
                            className="input-minimal w-full px-4 py-3 rounded-xl text-sm"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-3 uppercase tracking-wider">Select Collections to Share</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                            {categories.map(cat => (
                                <div
                                    key={cat.id}
                                    onClick={() => toggleSelection(cat.id)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${selectedIds.includes(cat.id)
                                        ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-200'
                                        : 'bg-[var(--bg-input)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--text-secondary)]'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedIds.includes(cat.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-[var(--border-strong)]'
                                        }`}>
                                        {selectedIds.includes(cat.id) && <Check className="w-3 h-3" />}
                                    </div>
                                    <span className="text-sm font-medium truncate">{cat.name}</span>
                                </div>
                            ))}
                        </div>
                        {categories.length === 0 && (
                            <p className="text-sm text-[var(--text-tertiary)] italic">No collections available to share.</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)] mt-4">
                        <button onClick={reset} className="px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
                            Cancel
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleGenerate}
                                disabled={!teamName || selectedIds.length === 0 || loading}
                                className="px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] bg-[var(--bg-input)] hover:bg-[var(--bg-secondary)] transition-all"
                            >
                                Copy Offline Code
                            </button>

                            <button
                                onClick={handleGenerateCloud}
                                disabled={!teamName || selectedIds.length === 0 || loading}
                                className="btn-primary px-4 py-2 rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
                            >
                                {loading ? 'Generating...' : <><Cloud className="w-3.5 h-3.5" /> Generate Easy Code</>}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center text-center gap-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border ${isCloudCode ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                        {isCloudCode ? <Cloud className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">{isCloudCode ? 'Easy Share Code Ready!' : 'Offline Team Code Ready!'}</h3>
                        <p className="text-sm text-[var(--text-secondary)] max-w-xs mx-auto">
                            {isCloudCode
                                ? "Share this short code with your team. They can enter it to join instantly."
                                : "This offline code works without internet. Share it securely."}
                        </p>
                    </div>

                    <div className="w-full relative group">
                        <div className={`absolute inset-0 bg-gradient-to-r blur-xl opacity-0 group-hover:opacity-100 transition-opacity ${isCloudCode ? 'from-blue-500/20 to-cyan-500/20' : 'from-green-500/20 to-emerald-500/20'}`} />
                        <div
                            className={`relative bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl p-4 font-mono text-center cursor-pointer hover:border-[var(--text-secondary)] transition-colors ${isCloudCode ? 'text-2xl font-bold tracking-widest text-[var(--text-primary)]' : 'text-xs break-all text-[var(--text-secondary)] text-left'}`}
                            onClick={handleCopy}
                        >
                            {generatedCode}
                        </div>
                    </div>

                    <button
                        onClick={handleCopy}
                        className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-sm ${copied ? 'bg-green-500 text-white' : 'btn-primary'
                            }`}
                    >
                        {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy Code</>}
                    </button>
                </div>
            )}
        </Modal>
    );
}

export function JoinTeamModal({ isOpen, onClose, onJoin }) {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!code) return;
        setLoading(true);
        setError('');

        try {
            // Check if it's a short Cloud Code (e.g., ABC-123 or ABC123456)
            // Heuristic: Length < 20 generally means it's not a compressed JSON payload
            if (code.length < 20) {
                const teamData = await teamStorage.getTeam(code);
                if (teamData) {
                    onJoin(teamData);
                    setCode('');
                    onClose();
                } else {
                    setError('Team code not found. Check the code and try again.');
                }
            } else {
                // Fallback to offline/compressed decode
                const teamData = decodeTeam(code);
                if (teamData && teamData.name && teamData.categories) {
                    onJoin(teamData);
                    setCode('');
                    onClose();
                } else {
                    setError('Invalid or corrupted team code.');
                }
            }
        } catch (err) {
            console.error(err);
            setError('Failed to join team. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Join Team Dashboard">
            <form onSubmit={handleJoin} className="flex flex-col gap-6">
                <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                        Enter Team Code
                    </label>
                    <textarea
                        value={code}
                        onChange={(e) => { setCode(e.target.value); setError(''); }}
                        placeholder="Paste the code here (e.g. ABC-123 or offline code)..."
                        className="input-minimal w-full px-4 py-3 rounded-xl text-sm font-mono min-h-[100px] resize-none"
                        autoFocus
                    />
                    {error && <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-400" /> {error}</p>}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)] mt-4">
                    <button type="button" onClick={onClose} className="px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={!code || loading}
                        className="btn-primary px-4 py-2 rounded-lg text-xs font-medium disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                    >
                        {loading && <div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                        {loading ? 'Joining...' : 'Import Dashboard'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { generateSecretKey, deriveSyncId, encryptData, decryptData } from '../utils/cryptoUtils';
import { cloudStorage } from '../services/firebase';

const SYNC_DEBOUNCE_MS = 2000;

export function useCloudSync(localData, setLocalData) {
    const [syncState, setSyncState] = useState({
        status: 'idle', // idle, syncing, synced, error, recovering
        lastSynced: null,
        error: null
    });

    const [recoveryKey, setRecoveryKey] = useState(() => {
        return localStorage.getItem('url_dashboard_recovery_key') || null;
    });

    // Save key locally
    const saveKey = (key) => {
        setRecoveryKey(key);
        localStorage.setItem('url_dashboard_recovery_key', key);
    };

    // 1. Enable Sync (Generate Key)
    const enableSync = async () => {
        try {
            const key = generateSecretKey();
            saveKey(key);
            await syncToCloud(key, localData);
            return key; // Return for display
        } catch (e) {
            console.error(e);
            setSyncState(prev => ({ ...prev, status: 'error', error: 'Failed to enable sync' }));
            throw e;
        }
    };

    // 2. Recover Account (Import Key)
    const recoverAccount = async (key) => {
        setSyncState(prev => ({ ...prev, status: 'recovering' }));
        try {
            const syncId = await deriveSyncId(key);
            const encryptedData = await cloudStorage.load(syncId);

            if (!encryptedData) {
                throw new Error("No data found for this key.");
            }

            const decryptedData = await decryptData(encryptedData, key);

            // Restore data
            setLocalData(decryptedData);
            saveKey(key);
            setSyncState({ status: 'synced', lastSynced: new Date(), error: null });

            return true;
        } catch (e) {
            console.error(e);
            setSyncState(prev => ({ ...prev, status: 'error', error: e.message || 'Recovery failed' }));
            return false;
        }
    };

    // 3. Sync to Cloud (Internal)
    const syncToCloud = useCallback(async (key, data) => {
        if (!key) return;
        setSyncState(prev => ({ ...prev, status: 'syncing' }));
        try {
            const syncId = await deriveSyncId(key);
            const encrypted = await encryptData(data, key);
            await cloudStorage.save(syncId, encrypted);
            setSyncState({ status: 'synced', lastSynced: new Date(), error: null });
        } catch (e) {
            console.error('Sync failed', e);
            setSyncState(prev => ({ ...prev, status: 'error', error: 'Sync failed' }));
        }
    }, []);

    const isRemoteUpdate = useRef(false);
    const localDataRef = useRef(localData);

    // Keep ref updated
    useEffect(() => {
        localDataRef.current = localData;
    }, [localData]);

    // 4. Auto-Sync Effect
    useEffect(() => {
        if (!recoveryKey || !localData) return;

        // If this update came from the cloud, don't echo it back
        if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false;
            return;
        }

        // Simple debounce
        const timer = setTimeout(() => {
            syncToCloud(recoveryKey, localData);
        }, SYNC_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [localData, recoveryKey, syncToCloud]);

    // 5. Subscription Effect (Listen for Cloud Changes)
    useEffect(() => {
        if (!recoveryKey || syncState.status === 'recovering') return;

        let unsubscribe = () => { };

        const setupSubscription = async () => {
            try {
                const syncId = await deriveSyncId(recoveryKey);
                unsubscribe = cloudStorage.subscribe(syncId, async (encryptedData) => {
                    if (!encryptedData) return;

                    // Decrypt and compare
                    try {
                        const decrypted = await decryptData(encryptedData, recoveryKey);
                        // Compare against LATEST local data
                        if (JSON.stringify(decrypted) !== JSON.stringify(localDataRef.current)) {
                            console.log("Received remote update");
                            isRemoteUpdate.current = true;
                            setLocalData(decrypted);
                            setSyncState(prev => ({ ...prev, status: 'synced', lastSynced: new Date() }));
                        }
                    } catch (e) {
                        console.error("Failed to decrypt remote update", e);
                    }
                });
            } catch (e) {
                console.error("Subscription setup failed", e);
            }
        };

        setupSubscription();

        return () => unsubscribe();
    }, [recoveryKey, setLocalData]);

    // 5. Disconnect (Stop Syncing)
    const disconnect = useCallback(() => {
        setRecoveryKey(null);
        localStorage.removeItem('url_dashboard_recovery_key');
        setSyncState({
            status: 'idle',
            lastSynced: null,
            error: null
        });
    }, []);

    return {
        syncState,
        recoveryKey,
        enableSync,
        recoverAccount,
        disconnect
    };
}

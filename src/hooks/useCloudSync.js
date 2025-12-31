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
            const response = await cloudStorage.load(syncId);

            if (!response) {
                throw new Error("No data found for this key.");
            }

            const { data: encryptedData, updatedAt } = response;
            const decryptedData = await decryptData(encryptedData, key);

            // Restore data
            setLocalData(decryptedData);
            saveKey(key);
            lastSyncedAt.current = new Date(updatedAt).getTime();
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
    const lastSyncedAt = useRef(0);

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

    // 5. Manual Pull from Cloud
    const pullFromCloud = useCallback(async () => {
        if (!recoveryKey) return false;

        setSyncState(prev => ({ ...prev, status: 'syncing' }));
        try {
            const syncId = await deriveSyncId(recoveryKey);
            const response = await cloudStorage.load(syncId);

            if (!response) {
                setSyncState(prev => ({ ...prev, status: 'error', error: 'No cloud data found' }));
                return false;
            }

            const { data: encryptedData, updatedAt } = response;
            const decrypted = await decryptData(encryptedData, recoveryKey);

            // Update local data
            isRemoteUpdate.current = true;
            lastSyncedAt.current = new Date(updatedAt).getTime();
            setLocalData(decrypted);
            setSyncState({ status: 'synced', lastSynced: new Date(), error: null });

            return true;
        } catch (e) {
            console.error('Pull failed', e);
            setSyncState(prev => ({ ...prev, status: 'error', error: 'Failed to fetch from cloud' }));
            return false;
        }
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
        pullFromCloud,
        disconnect
    };
}

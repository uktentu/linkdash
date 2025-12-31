// cryptoUtils.js - Zero-Knowledge Security Utilities

// 1. Generate a strong random key (UUID-like but cryptographically secure)
export const generateSecretKey = () => {
    return crypto.randomUUID() + '-' + Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
};

// 2. Derive a public Sync ID (for the database filename) from the secret key
// We use SHA-256 so the server knows the ID but cannot reverse it to get the key.
export const deriveSyncId = async (secretKey) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(secretKey);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0')).join('');
};

// 3. Import Key for Encryption
const importKey = async (secretKey) => {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    // We hash the key first to ensure it's the right length (256 bits) for AES-256
    const hash = await crypto.subtle.digest('SHA-256', keyData);

    return await crypto.subtle.importKey(
        'raw',
        hash,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
    );
};

// 4. Encrypt Data
export const encryptData = async (dataObj, secretKey) => {
    try {
        const key = await importKey(secretKey);
        const iv = crypto.getRandomValues(new Uint8Array(12)); // IV must be unique for every encryption
        const encoder = new TextEncoder();
        const encodedData = encoder.encode(JSON.stringify(dataObj));

        const encryptedContent = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encodedData
        );

        // We need to store both the IV and the Encrypted Data
        // Combine them into a single blob/string for storage
        const encryptedArray = new Uint8Array(encryptedContent);
        const combined = new Uint8Array(iv.length + encryptedArray.length);
        combined.set(iv);
        combined.set(encryptedArray, iv.length);

        // Convert to Base64 for easy JSON storage
        return btoa(String.fromCharCode(...combined));
    } catch (e) {
        console.error('Encryption failed:', e);
        throw new Error('Failed to encrypt data');
    }
};

// 5. Decrypt Data
export const decryptData = async (encryptedBase64, secretKey) => {
    try {
        const key = await importKey(secretKey);

        // Decode Base64
        const combined = new Uint8Array(
            atob(encryptedBase64).split('').map(c => c.charCodeAt(0))
        );

        // Extract IV and Data
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);

        const decryptedContent = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            data
        );

        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(decryptedContent));
    } catch (e) {
        console.error('Decryption failed:', e);
        throw new Error('Invalid Key or Corrupted Data');
    }
};

import LZString from 'lz-string';

export const encodeTeam = (data) => {
    try {
        // Compress the JSON string to a URL-safe format
        return LZString.compressToEncodedURIComponent(JSON.stringify(data));
    } catch (e) {
        console.error('Failed to encode team data', e);
        return null;
    }
};

export const decodeTeam = (code) => {
    try {
        // 1. Try to decompress first (New format)
        let decompressed = LZString.decompressFromEncodedURIComponent(code);

        // 2. If valid string, try parsing
        if (decompressed && decompressed.startsWith('{')) {
            return JSON.parse(decompressed);
        }

        // 3. If decompression returns null or garbage, fallback to Legacy (Base64)
        // Try decoding as legacy base64
        const legacyDecoded = decodeURIComponent(atob(code));
        return JSON.parse(legacyDecoded);
    } catch (e) {
        // Silent fail for backward compatibility checks often throw
        console.warn('Failed to decode team data (legacy fallback also failed)', e);
        return null;
    }
};

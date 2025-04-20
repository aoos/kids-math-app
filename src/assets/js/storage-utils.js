/**
 * Enhanced localStorage with TTL support
 */
class StorageWithTTL {
    constructor(storage = localStorage) {
        this.storage = storage;
    }

    /**
     * Set item with optional expiration time
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @param {number} ttl - Time to live in milliseconds
     */
    setWithTTL(key, value, ttl = null) {
        const item = {
            value: value,
            expiry: ttl ? Date.now() + ttl : null
        };
        this.storage.setItem(key, JSON.stringify(item));
    }

    /**
     * Get item if not expired
     * @param {string} key - Storage key
     * @returns {*} The stored value or null if expired/not found
     */
    getWithTTL(key) {
        const itemStr = this.storage.getItem(key);
        if (!itemStr) return null;

        try {
            const item = JSON.parse(itemStr);
            if (item.expiry && Date.now() > item.expiry) {
                this.storage.removeItem(key);
                return null;
            }
            return item.value;
        } catch (e) {
            return null;
        }
    }
}

// Initialize and attach to window for global use
window.storageWithTTL = new StorageWithTTL(localStorage);

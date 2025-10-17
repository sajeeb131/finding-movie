// Simple in-memory cache service for movie recommendations
// This can be replaced with Redis later for better persistence

class CacheService {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = 3600000; // 1 hour in milliseconds
    }

    /**
     * Get value from cache
     * @param {string} key - Cache key
     * @returns {*} - Cached value or null
     */
    get(key) {
        const item = this.cache.get(key);
        
        if (!item) {
            return null;
        }
        
        // Check if item has expired
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    /**
     * Set value in cache with TTL
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} ttl - Time to live in milliseconds
     */
    set(key, value, ttl = this.defaultTTL) {
        const expiry = Date.now() + ttl;
        this.cache.set(key, { value, expiry });
    }

    /**
     * Delete item from cache
     * @param {string} key - Cache key
     */
    delete(key) {
        this.cache.delete(key);
    }

    /**
     * Clear all cache entries
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Get cache statistics
     * @returns {Object} - Cache stats
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    /**
     * Create a cache key from parameters
     * @param {string} prefix - Key prefix
     * @param {...any} params - Parameters to include in key
     * @returns {string} - Generated cache key
     */
    createKey(prefix, ...params) {
        const paramString = params
            .map(p => typeof p === 'object' ? JSON.stringify(p) : String(p))
            .join(':');
        return `${prefix}:${paramString}`;
    }
}

// Create singleton instance
const cacheService = new CacheService();

// Clean up expired entries every 10 minutes
setInterval(() => {
    cacheService.cleanup();
}, 600000);

module.exports = cacheService;
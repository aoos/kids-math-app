// ShowOneChild.js

class ShowOneChild {
    constructor() {
        // Initialization code
    }

    readRenderPromptFromStorage() {
        // Check if storage object exists before accessing getWithTTL
        const storage = this.getStorage ? this.getStorage() : window.localStorage;

        if (!storage || typeof storage.getWithTTL !== 'function') {
            console.warn('Storage or getWithTTL method not available');
            return null;
        }

        return storage.getWithTTL('renderPrompt');
    }

    // Other methods and logic
}

export default ShowOneChild;
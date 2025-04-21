// ShowOneChild.js

class ShowOneChild {
    constructor() {
        // Initialization code
    }

    readRenderPromptFromStorage() {
        // Check if window.storageWithTTL exists before accessing getWithTTL
        if (!window.storageWithTTL) {
            console.warn('Storage utility not found. Make sure storage-utils.js is loaded.');
            return null;
        }
        
        try {
            return window.storageWithTTL.getWithTTL('renderPrompt');
        } catch (error) {
            console.error('Error accessing storage:', error);
            return null;
        }
    }

    // Other methods and logic
}

export default ShowOneChild;
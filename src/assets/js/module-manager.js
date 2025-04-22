// Module manager - handles saving, loading, and deleting modules

const STORAGE_KEY = 'ai_learning_modules';

/**
 * Saves a module to local storage
 * @param {Object} module The module to save
 * @returns {Promise<void>}
 */
export async function saveModule(module) {
    const modules = await loadAllModules() || [];
    
    // Check if we're updating an existing module
    const existingIndex = modules.findIndex(m => m.id === module.id);
    
    if (existingIndex >= 0) {
        // Update existing module
        modules[existingIndex] = module;
    } else {
        // Add new module
        modules.push(module);
    }
    
    // Save to storage
    window.storageWithTTL.setWithTTL(STORAGE_KEY, modules);
}

/**
 * Loads all saved modules from storage
 * @returns {Promise<Array>} Array of saved modules
 */
export async function loadAllModules() {
    return window.storageWithTTL.getWithTTL(STORAGE_KEY) || [];
}

/**
 * Loads a specific module by ID
 * @param {string} id The module ID
 * @returns {Promise<Object|null>} The module or null if not found
 */
export async function loadModule(id) {
    const modules = await loadAllModules();
    return modules.find(module => module.id === id) || null;
}

/**
 * Deletes a module by index
 * @param {number} index The index of the module to delete
 * @returns {Promise<void>}
 */
export async function deleteModule(index) {
    const modules = await loadAllModules();
    
    if (index >= 0 && index < modules.length) {
        modules.splice(index, 1);
        window.storageWithTTL.setWithTTL(STORAGE_KEY, modules);
    }
}

/**
 * Deletes a module by ID
 * @param {string} id The ID of the module to delete
 * @returns {Promise<void>}
 */
export async function deleteModuleById(id) {
    const modules = await loadAllModules();
    const index = modules.findIndex(module => module.id === id);
    
    if (index !== -1) {
        await deleteModule(index);
    }
}
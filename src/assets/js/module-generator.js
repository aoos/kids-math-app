// Module generator - converts AI responses to usable modules

/**
 * Creates a module object from an AI response
 * @param {string} aiResponse The raw text response from OpenAI
 * @returns {Object} A structured module object
 */
export async function createModuleFromResponse(aiResponse) {
    try {
        // Extract JSON from the response
        const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                         aiResponse.match(/```\s*([\s\S]*?)\s*```/) ||
                         [null, aiResponse];
        
        const jsonContent = jsonMatch[1] || aiResponse;
        
        // Parse the JSON
        let moduleData = JSON.parse(jsonContent);
        
        // Generate a unique ID for the module
        moduleData.id = generateUniqueId();
        
        // Store the original description from the prompt
        moduleData.originalDescription = moduleData.description;
        
        return moduleData;
    } catch (error) {
        console.error('Error parsing AI response:', error);
        throw new Error('Could not parse the AI response. Please try again.');
    }
}

/**
 * Validates that a module has all required properties
 * @param {Object} module The module to validate
 * @returns {boolean} Whether the module is valid
 */
export function validateModule(module) {
    // Required fields
    const requiredFields = ['title', 'type', 'difficulty', 'description', 'instructions', 'problems'];
    
    for (const field of requiredFields) {
        if (!module[field]) {
            console.error(`Module missing required field: ${field}`);
            return false;
        }
    }
    
    // Check that problems is an array with at least one problem
    if (!Array.isArray(module.problems) || module.problems.length === 0) {
        console.error('Module must have at least one problem');
        return false;
    }
    
    // Check that each problem has the required fields
    for (const problem of module.problems) {
        if (!problem.question || !problem.answer) {
            console.error('Each problem must have a question and answer');
            return false;
        }
    }
    
    return true;
}

/**
 * Generates a unique ID for a module
 * @returns {string} A unique ID
 */
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}
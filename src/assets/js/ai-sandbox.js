// AI Sandbox main controller

import { generateModuleFromPrompt } from './openai-client.js';
import { createModuleFromResponse, validateModule } from './module-generator.js';
import { saveModule, loadAllModules, deleteModule } from './module-manager.js';

// DOM Elements
let moduleType;
let difficultyLevel;
let moduleDescription;
let generateButton;
let editButton;
let saveButton;
let tryButton;
let generationStatus;
let modulePreview;
let previewContent;
let savedModulesContainer;

// State variables
let currentModule = null;

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM references
    moduleType = document.getElementById('module-type');
    difficultyLevel = document.getElementById('difficulty-level');
    moduleDescription = document.getElementById('module-description');
    generateButton = document.getElementById('generate-module');
    editButton = document.getElementById('edit-module');
    saveButton = document.getElementById('save-module');
    tryButton = document.getElementById('try-module');
    generationStatus = document.getElementById('generation-status');
    modulePreview = document.getElementById('module-preview');
    previewContent = document.getElementById('preview-content');
    savedModulesContainer = document.getElementById('modules-list');
    
    // Set up event listeners
    setupEventListeners();
    
    // Load saved modules
    displaySavedModules();
});

function setupEventListeners() {
    generateButton.addEventListener('click', handleGenerateClick);
    editButton.addEventListener('click', handleEditClick);
    saveButton.addEventListener('click', handleSaveClick);
    tryButton.addEventListener('click', handleTryClick);
}

async function handleGenerateClick() {
    // Validate inputs
    const description = moduleDescription.value.trim();
    if (!description) {
        showStatus('Please describe the module you want to create', 'error');
        return;
    }
    
    // Clear any previous status
    showStatus('Generating your custom module...', 'loading');
    toggleGenerateButtonLoading(true);
    
    try {
        // Generate a prompt for the AI
        const prompt = generatePrompt();
        
        // Call OpenAI API
        const response = await generateModuleFromPrompt(prompt);
        
        // Parse the AI response into a module
        currentModule = await createModuleFromResponse(response);
        
        // Validate the generated module
        const isValid = validateModule(currentModule);
        
        if (!isValid) {
            throw new Error('The AI generated an invalid module format. Please try again with a more specific description.');
        }
        
        // Show the preview
        displayModulePreview(currentModule);
        
        // Show success message
        showStatus('Module generated successfully!', 'success');
        
        // Show the preview panel
        modulePreview.style.display = 'block';
        
    } catch (error) {
        showStatus(`Error generating module: ${error.message}`, 'error');
    } finally {
        toggleGenerateButtonLoading(false);
    }
}

function handleEditClick() {
    // Hide the preview panel and show the form for editing
    modulePreview.style.display = 'none';
    
    // If we have current module data, let's prefill the form
    if (currentModule) {
        moduleDescription.value = currentModule.originalDescription || moduleDescription.value;
    }
    
    // Clear any status messages
    generationStatus.textContent = '';
    generationStatus.className = 'status-message';
}

async function handleSaveClick() {
    if (!currentModule) {
        showStatus('No module to save', 'error');
        return;
    }
    
    try {
        // Add timestamp and save the module
        currentModule.createdAt = new Date().toISOString();
        await saveModule(currentModule);
        
        showStatus('Module saved successfully!', 'success');
        
        // Refresh the saved modules list
        displaySavedModules();
    } catch (error) {
        showStatus(`Error saving module: ${error.message}`, 'error');
    }
}

function handleTryClick() {
    if (!currentModule) {
        showStatus('No module to try', 'error');
        return;
    }
    
    // Store the current module in localStorage
    window.storageWithTTL.setWithTTL('activeModule', currentModule);
    
    // Navigate to the appropriate page based on module type
    window.location.href = generateModuleUrl(currentModule);
}

function generatePrompt() {
    const type = moduleType.value;
    const difficulty = difficultyLevel.value;
    const description = moduleDescription.value.trim();
    
    return `
Create a math learning module for children with the following specifications:
- Type: ${type}
- Difficulty: ${difficulty}
- Description: ${description}

Your response should be structured as a valid JSON object with the following format:
{
  "title": "Module title",
  "type": "The module type",
  "difficulty": "The difficulty level",
  "description": "A short description of what this module teaches",
  "instructions": "Instructions for the student",
  "problems": [
    {
      "question": "The problem question text",
      "answer": "The correct answer or answer logic",
      "hints": ["Optional hint 1", "Optional hint 2"],
      "explanation": "Explanation of the answer"
    }
    // Include 5-10 problems
  ],
  "visualAids": {
    // Optional visual aids configuration
  }
}

Ensure your response contains only valid JSON that can be parsed by JavaScript.
`;
}

function displayModulePreview(module) {
    // Create a user-friendly preview
    let preview = `
        <div class="preview-header">
            <h3>${module.title}</h3>
            <p>${module.description}</p>
        </div>
        <div class="preview-instructions">
            <h4>Instructions:</h4>
            <p>${module.instructions}</p>
        </div>
        <div class="preview-problems">
            <h4>Sample Problems (${module.problems.length} total):</h4>
            <ul>
    `;
    
    // Show first 3 problems
    const samplesToShow = Math.min(3, module.problems.length);
    for (let i = 0; i < samplesToShow; i++) {
        const problem = module.problems[i];
        preview += `
            <li>
                <div class="problem-question">${problem.question}</div>
                <div class="problem-answer">Answer: ${problem.answer}</div>
            </li>
        `;
    }
    
    preview += `
            </ul>
        </div>
    `;
    
    previewContent.innerHTML = preview;
}

async function displaySavedModules() {
    const modules = await loadAllModules();
    
    if (!modules || modules.length === 0) {
        savedModulesContainer.innerHTML = '<div class="no-modules-message">No saved modules yet</div>';
        return;
    }
    
    let html = '';
    modules.forEach((module, index) => {
        const date = new Date(module.createdAt);
        const formattedDate = date.toLocaleDateString();
        
        html += `
            <div class="module-card" data-id="${index}">
                <div class="module-title">${module.title}</div>
                <div class="module-description">${module.description}</div>
                <div class="module-date">Created: ${formattedDate}</div>
                <div class="module-actions">
                    <button class="use-module primary" data-id="${index}">Use</button>
                    <button class="edit-module secondary" data-id="${index}">Edit</button>
                    <button class="delete-module" data-id="${index}">Delete</button>
                </div>
            </div>
        `;
    });
    
    savedModulesContainer.innerHTML = html;
    
    // Add event listeners to the buttons
    document.querySelectorAll('.use-module').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            useModule(modules[id]);
        });
    });
    
    document.querySelectorAll('.edit-module').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            editSavedModule(modules[id]);
        });
    });
    
    document.querySelectorAll('.delete-module').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            deleteModuleWithConfirmation(id);
        });
    });
}

function useModule(module) {
    // Set as current module
    currentModule = module;
    
    // Show in preview
    displayModulePreview(module);
    modulePreview.style.display = 'block';
}

function editSavedModule(module) {
    // Set as current module
    currentModule = module;
    
    // Fill the form with the module data
    moduleType.value = module.type || 'custom';
    difficultyLevel.value = module.difficulty || 'intermediate';
    moduleDescription.value = module.originalDescription || module.description;
    
    // Hide preview panel
    modulePreview.style.display = 'none';
    
    // Scroll to the form
    document.getElementById('module-request-form').scrollIntoView({ behavior: 'smooth' });
}

async function deleteModuleWithConfirmation(id) {
    const confirm = window.confirm('Are you sure you want to delete this module?');
    if (confirm) {
        await deleteModule(id);
        displaySavedModules();
    }
}

function showStatus(message, type) {
    generationStatus.textContent = message;
    generationStatus.className = 'status-message';
    if (type) {
        generationStatus.classList.add(type);
    }
}

function toggleGenerateButtonLoading(isLoading) {
    if (isLoading) {
        generateButton.disabled = true;
        generateButton.textContent = 'Generating...';
    } else {
        generateButton.disabled = false;
        generateButton.textContent = 'Generate Module';
    }
}

function generateModuleUrl(module) {
    // Determine which game page to use based on module type
    let basePage = 'custom-module.html';
    
    switch (module.type.toLowerCase()) {
        case 'math-practice':
            if (module.subtype === 'addition' || module.subtype === 'subtraction' || 
                module.subtype === 'multiplication' || module.subtype === 'division') {
                basePage = `${module.subtype}.html`;
            }
            break;
        case 'number-sense':
            if (module.focusArea === 'rounding') {
                basePage = 'rounding.html';
            } else if (module.focusArea === 'number-lines') {
                basePage = 'numberlines.html';
            }
            break;
    }
    
    return `./custom-module.html?id=${encodeURIComponent(module.id)}`;
}
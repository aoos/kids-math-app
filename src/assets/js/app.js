// Import storage utilities first
import './storage-utils.js';

import mathProblems from './mathProblems.js';
import uiController from './uiController.js';

document.addEventListener('DOMContentLoaded', () => {
    const subjectSelect = document.getElementById('subject-select');
    const problemContainer = document.getElementById('problem-container');
    const answerInput = document.getElementById('answer-input');
    const submitButton = document.getElementById('submit-button');
    const feedback = document.getElementById('feedback');

    let currentProblem;

    subjectSelect.addEventListener('change', () => {
        const selectedSubject = subjectSelect.value;
        currentProblem = mathProblems.generateProblem(selectedSubject);
        uiController.displayProblem(problemContainer, currentProblem);
        feedback.textContent = '';
    });

    submitButton.addEventListener('click', () => {
        const userAnswer = parseInt(answerInput.value, 10);
        if (mathProblems.validateAnswer(currentProblem, userAnswer)) {
            feedback.textContent = 'Correct!';
            uiController.playSound('correct');
        } else {
            feedback.textContent = 'Try again!';
            uiController.playSound('incorrect');
        }
        answerInput.value = '';
    });

    // Ensure StorageWithTTL is properly initialized
    if (typeof window.storageWithTTL === 'undefined') {
        console.warn('StorageWithTTL not found, initializing default implementation');
        // Create a fallback implementation if not already defined
        window.storageWithTTL = new (function() {
            this.getWithTTL = function(key) {
                return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)) : null;
            };
            this.setWithTTL = function(key, value) {
                localStorage.setItem(key, JSON.stringify(value));
            };
            this.removeItem = function(key) {
                localStorage.removeItem(key);
            };
        })();
    }

    // Initialize any other components
});

// Make sure ShowOneChild can access the storage
if (typeof window.ShowOneChild !== 'undefined') {
    window.ShowOneChild.prototype.getStorage = function() {
        return window.storageWithTTL;
    };
}
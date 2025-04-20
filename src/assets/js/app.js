// Import storage utilities first
import './storage-utils.js';

const mathProblems = require('./mathProblems');
const uiController = require('./uiController');

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
});

// Make sure ShowOneChild can access the storage
if (typeof ShowOneChild !== 'undefined') {
    ShowOneChild.prototype.getStorage = function() {
        return window.storageWithTTL;
    };
}
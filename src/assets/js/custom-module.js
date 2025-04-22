// Custom Module Page Controller

import { loadModule } from './module-manager.js';

// DOM Elements
let moduleTitle;
let moduleInstructions;
let problemText;
let userAnswer;
let checkButton;
let nextButton;
let feedback;
let explanation;
let progressCount;
let progressFill;
let completionMessage;
let restartButton;
let backToSandboxButton;
let completedCount;
let correctCount;
let accuracyPercentage;

// Module state
let currentModule = null;
let currentProblemIndex = 0;
let correctAnswers = 0;
let answeredProblems = 0;

document.addEventListener('DOMContentLoaded', async () => {
    // Get DOM references
    setupDomReferences();
    
    // Load module data
    await loadModuleData();
    
    // Display first problem
    displayProblem();
    
    // Set up event listeners
    setupEventListeners();
});

function setupDomReferences() {
    moduleTitle = document.getElementById('module-title');
    moduleInstructions = document.getElementById('module-instructions');
    problemText = document.getElementById('problem-text');
    userAnswer = document.getElementById('user-answer');
    checkButton = document.getElementById('check-button');
    nextButton = document.getElementById('next-button');
    feedback = document.getElementById('feedback');
    explanation = document.getElementById('explanation');
    progressCount = document.getElementById('progress-count');
    progressFill = document.getElementById('progress-fill');
    completionMessage = document.getElementById('completion-message');
    restartButton = document.getElementById('restart-button');
    backToSandboxButton = document.getElementById('back-to-sandbox-button');
    completedCount = document.getElementById('completed-count');
    correctCount = document.getElementById('correct-count');
    accuracyPercentage = document.getElementById('accuracy-percentage');
}

async function loadModuleData() {
    // Check for module ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const moduleId = urlParams.get('id');
    
    if (moduleId) {
        // Load module by ID
        currentModule = await loadModule(moduleId);
    }
    
    // If no module ID or module not found, check for active module in storage
    if (!currentModule) {
        currentModule = window.storageWithTTL.getWithTTL('activeModule');
    }
    
    // If still no module, show error
    if (!currentModule) {
        showError('No module data found. Please go back to the sandbox and create a new module.');
        return;
    }
    
    // Update page title and module title
    document.title = currentModule.title;
    moduleTitle.textContent = currentModule.title;
    
    // Display instructions
    moduleInstructions.textContent = currentModule.instructions;
    
    // Update progress
    updateProgress();
}

function displayProblem() {
    if (!currentModule || !currentModule.problems) return;
    
    // Check if we've reached the end of the problems
    if (currentProblemIndex >= currentModule.problems.length) {
        showCompletionMessage();
        return;
    }
    
    const problem = currentModule.problems[currentProblemIndex];
    
    // Display the problem
    problemText.innerHTML = problem.question;
    
    // Clear previous user input and feedback
    userAnswer.value = '';
    feedback.textContent = '';
    feedback.className = 'feedback';
    explanation.style.display = 'none';
    
    // Update UI elements
    checkButton.style.display = 'inline-block';
    nextButton.style.display = 'none';
    
    // Focus on the input field
    userAnswer.focus();
    
    // Add hints if available
    if (problem.hints && problem.hints.length > 0) {
        addHintSystem(problem.hints);
    }
    
    // Update progress indicator
    updateProgress();
}

function setupEventListeners() {
    // Check answer button
    checkButton.addEventListener('click', checkAnswer);
    
    // Next button
    nextButton.addEventListener('click', () => {
        currentProblemIndex++;
        displayProblem();
    });
    
    // Enter key in input field
    userAnswer.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (checkButton.style.display !== 'none') {
                checkAnswer();
            } else if (nextButton.style.display !== 'none') {
                nextButton.click();
            }
        }
    });
    
    // Restart button
    restartButton.addEventListener('click', () => {
        currentProblemIndex = 0;
        correctAnswers = 0;
        answeredProblems = 0;
        completionMessage.style.display = 'none';
        updateStats();
        displayProblem();
    });
    
    // Back to sandbox button
    backToSandboxButton.addEventListener('click', () => {
        window.location.href = './ai-sandbox.html';
    });
}

function checkAnswer() {
    if (!currentModule || !currentModule.problems) return;
    
    const problem = currentModule.problems[currentProblemIndex];
    const answer = userAnswer.value.trim();
    
    // Validate input
    if (!answer) {
        feedback.textContent = 'Please enter an answer';
        feedback.className = 'feedback';
        return;
    }
    
    // Check answer
    const isCorrect = isAnswerCorrect(problem.answer, answer);
    
    // Update stats
    answeredProblems++;
    if (isCorrect) {
        correctAnswers++;
    }
    
    // Update display
    feedback.textContent = isCorrect ? 'Correct! Great job!' : 'Not quite. Try again next time.';
    feedback.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
    
    // Show explanation if available
    if (problem.explanation) {
        explanation.textContent = problem.explanation;
        explanation.style.display = 'block';
    }
    
    // Hide check button, show next button
    checkButton.style.display = 'none';
    nextButton.style.display = 'inline-block';
    
    // Update stats display
    updateStats();
}

function isAnswerCorrect(correctAnswer, userAnswer) {
    // First try exact match
    if (userAnswer === correctAnswer.toString()) {
        return true;
    }
    
    // For numerical answers, try numeric comparison
    if (!isNaN(correctAnswer) && !isNaN(userAnswer)) {
        return parseFloat(userAnswer) === parseFloat(correctAnswer);
    }
    
    // For string answers, try case insensitive match
    return userAnswer.toLowerCase() === correctAnswer.toString().toLowerCase();
}

function updateProgress() {
    if (!currentModule || !currentModule.problems) return;
    
    // Update progress text
    progressCount.textContent = `${currentProblemIndex}/${currentModule.problems.length}`;
    
    // Update progress bar
    const percentage = (currentProblemIndex / currentModule.problems.length) * 100;
    progressFill.style.width = `${percentage}%`;
}

function updateStats() {
    completedCount.textContent = answeredProblems;
    correctCount.textContent = correctAnswers;
    
    const accuracy = answeredProblems > 0 ? Math.round((correctAnswers / answeredProblems) * 100) : 0;
    accuracyPercentage.textContent = `${accuracy}%`;
}

function showCompletionMessage() {
    document.getElementById('module-container').style.display = 'none';
    completionMessage.style.display = 'block';
}

function addHintSystem(hints) {
    // Create hint container if not exists
    let hintContainer = document.querySelector('.hint-container');
    if (!hintContainer) {
        hintContainer = document.createElement('div');
        hintContainer.className = 'hint-container';
        problemText.after(hintContainer);
    } else {
        hintContainer.innerHTML = '';
    }
    
    // Create hint toggle button
    const hintToggle = document.createElement('button');
    hintToggle.className = 'hint-toggle';
    hintToggle.textContent = 'Show Hint';
    hintContainer.appendChild(hintToggle);
    
    // Create hint content
    const hintContent = document.createElement('div');
    hintContent.className = 'hint-content';
    
    // Add each hint as a paragraph
    hints.forEach((hint, index) => {
        const p = document.createElement('p');
        p.textContent = hint;
        hintContent.appendChild(p);
    });
    
    hintContainer.appendChild(hintContent);
    
    // Add event listener to toggle hint visibility
    hintToggle.addEventListener('click', () => {
        const isVisible = hintContent.style.display === 'block';
        hintContent.style.display = isVisible ? 'none' : 'block';
        hintToggle.textContent = isVisible ? 'Show Hint' : 'Hide Hint';
    });
}

function showError(message) {
    // Hide regular content
    document.getElementById('module-container').style.display = 'none';
    document.querySelector('.stats-container').style.display = 'none';
    
    // Create and show error message
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-container';
    errorContainer.innerHTML = `
        <div class="error-message">
            <h2>Error</h2>
            <p>${message}</p>
            <button class="game-button" onclick="window.location.href='./ai-sandbox.html'">
                Go to Sandbox
            </button>
        </div>
    `;
    
    document.querySelector('.container').appendChild(errorContainer);
}
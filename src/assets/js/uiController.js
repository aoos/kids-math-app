function displayProblem(problem) {
    const problemElement = document.getElementById('problem');
    problemElement.textContent = problem;
}

function captureInput() {
    const inputElement = document.getElementById('user-input');
    return inputElement.value;
}

function clearInput() {
    const inputElement = document.getElementById('user-input');
    inputElement.value = '';
}

function showFeedback(isCorrect) {
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.textContent = isCorrect ? 'Correct!' : 'Try again!';
}

function setupEventListeners() {
    const submitButton = document.getElementById('submit-button');
    submitButton.addEventListener('click', () => {
        const userAnswer = captureInput();
        // Assume validateAnswer is a function defined in mathProblems.js
        const isCorrect = validateAnswer(userAnswer);
        showFeedback(isCorrect);
        clearInput();
    });
}

export { displayProblem, captureInput, clearInput, showFeedback, setupEventListeners };
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const targetNumberElement = document.getElementById('target-number');
    const userAnswerInput = document.getElementById('user-answer');
    const checkAnswerButton = document.getElementById('check-answer');
    const nextNumberButton = document.getElementById('next-number');
    const feedbackElement = document.getElementById('feedback');
    const questionsCountElement = document.getElementById('questions-count');
    const correctCountElement = document.getElementById('correct-count');
    const accuracyPercentageElement = document.getElementById('accuracy-percentage');
    
    // Difficulty checkboxes
    const doubleDigitsCheckbox = document.getElementById('double-digits');
    const tripleDigitsCheckbox = document.getElementById('triple-digits');
    const fourDigitsCheckbox = document.getElementById('four-digits');
    const fiveDigitsCheckbox = document.getElementById('five-digits');
    const sixDigitsCheckbox = document.getElementById('six-digits');
    
    // Game state
    let currentNumber = 0;
    let correctAnswer = 0;
    let questionsCount = 0;
    let correctCount = 0;
    
    // Initialize the game
    generateNewNumber();
    userAnswerInput.focus();
    
    // Event listeners
    checkAnswerButton.addEventListener('click', () => {
        checkAnswer();
        // Hide check button, show next button
        checkAnswerButton.style.display = 'none';
        nextNumberButton.style.display = 'inline-block';
    });

    nextNumberButton.addEventListener('click', () => {
        generateNewNumber();
        userAnswerInput.value = '';
        userAnswerInput.focus();
        feedbackElement.textContent = '';
        feedbackElement.className = 'feedback';
        document.getElementById('number-line-visualization').style.display = 'none';
        
        // Hide next button, show check button
        nextNumberButton.style.display = 'none';
        checkAnswerButton.style.display = 'inline-block';
    });

    // Remove the keypress handler that automatically checks answer on Enter
    // This would bypass our button visibility logic
    userAnswerInput.removeEventListener('keypress', null);

    // Add a new keypress handler that respects button visibility
    userAnswerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (checkAnswerButton.style.display !== 'none') {
                // If check button is visible, trigger check
                checkAnswer();
                checkAnswerButton.style.display = 'none';
                nextNumberButton.style.display = 'inline-block';
            } else if (nextNumberButton.style.display !== 'none') {
                // If next button is visible, go to next problem
                nextNumberButton.click();
            }
        }
    });
    
    // Functions
    function generateNewNumber() {
        // Check which difficulty options are selected
        const availableDigits = [];
        if (doubleDigitsCheckbox.checked) availableDigits.push(2);
        if (tripleDigitsCheckbox.checked) availableDigits.push(3);
        if (fourDigitsCheckbox.checked) availableDigits.push(4);
        if (fiveDigitsCheckbox.checked) availableDigits.push(5);
        if (sixDigitsCheckbox.checked) availableDigits.push(6);
        
        // Default to all options if none selected
        if (availableDigits.length === 0) {
            availableDigits.push(2, 3, 4, 5, 6);
            
            // Update checkboxes to reflect this
            doubleDigitsCheckbox.checked = true;
            tripleDigitsCheckbox.checked = true;
            fourDigitsCheckbox.checked = true;
            fiveDigitsCheckbox.checked = true;
            sixDigitsCheckbox.checked = true;
        }
        
        // Select a random number of digits
        const numDigits = availableDigits[Math.floor(Math.random() * availableDigits.length)];
        
        // Generate a random number with the selected number of digits
        const minValue = Math.pow(10, numDigits - 1);
        const maxValue = Math.pow(10, numDigits) - 1;
        currentNumber = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
        
        // Display the number with comma formatting
        targetNumberElement.textContent = currentNumber.toLocaleString();
        
        // Calculate the correct rounded answer
        correctAnswer = calculateRoundedAnswer(currentNumber, numDigits);
    }
    
    function calculateRoundedAnswer(number, numDigits) {
        // For numbers with 2-3 digits, round to 1 significant digit
        // For numbers with 4-6 digits, round to 2 significant digits
        let sigDigits = (numDigits <= 3) ? 1 : 2;
        
        // Get the number of digits to round to
        const roundToDigit = Math.pow(10, numDigits - sigDigits);
        
        // Round the number
        return Math.round(number / roundToDigit) * roundToDigit;
    }
    
    function checkAnswer() {
        const userAnswer = parseInt(userAnswerInput.value);
        
        // Validate input
        if (isNaN(userAnswer)) {
            feedbackElement.textContent = 'Please enter a valid number.';
            feedbackElement.className = 'feedback';
            return;
        }
        
        // Increment questions count
        questionsCount++;
        
        // Check if answer is correct
        if (userAnswer === correctAnswer) {
            feedbackElement.textContent = 'Correct! Well done!';
            feedbackElement.className = 'feedback correct';
            correctCount++;
            
            // Hide number line if it was previously shown
            document.getElementById('number-line-visualization').style.display = 'none';
        } else {
            feedbackElement.textContent = `Incorrect. The correct rounded value is ${correctAnswer.toLocaleString()}.`;
            feedbackElement.className = 'feedback incorrect';
            
            // Show number line visualization
            showNumberLineVisualization(currentNumber, userAnswer, correctAnswer);
        }
        
        // Update stats
        updateStats();
    }
    
    function showNumberLineVisualization(originalNumber, userGuess, correctAnswer) {
        // Get the visualization elements
        const vizContainer = document.getElementById('number-line-visualization');
        const originalValueEl = document.getElementById('viz-original-value');
        const guessValueEl = document.getElementById('viz-guess-value');
        const correctValueEl = document.getElementById('viz-correct-value');
        const guessDiffEl = document.getElementById('guess-diff');
        const correctDiffEl = document.getElementById('correct-diff');
        
        // Set the values
        originalValueEl.textContent = originalNumber.toLocaleString();
        guessValueEl.textContent = userGuess.toLocaleString();
        correctValueEl.textContent = correctAnswer.toLocaleString();
        
        // Calculate differences
        const guessDiff = Math.abs(originalNumber - userGuess);
        const correctDiff = Math.abs(originalNumber - correctAnswer);
        
        // Format differences in parentheses
        guessDiffEl.textContent = `(${guessDiff.toLocaleString()})`;
        correctDiffEl.textContent = `(${correctDiff.toLocaleString()})`;
        
        // Calculate positions for the markers
        const min = Math.min(originalNumber, userGuess, correctAnswer) * 0.8;
        const max = Math.max(originalNumber, userGuess, correctAnswer) * 1.2;
        const range = max - min;
        
        // Position the markers
        const originalPos = ((originalNumber - min) / range) * 100;
        const guessPos = ((userGuess - min) / range) * 100;
        const correctPos = ((correctAnswer - min) / range) * 100;
        
        // Set positions
        document.getElementById('original-marker').style.left = `${originalPos}%`;
        document.getElementById('guess-marker').style.left = `${guessPos}%`;
        document.getElementById('correct-marker').style.left = `${correctPos}%`;
        
        // Show the visualization
        vizContainer.style.display = 'block';
    }
    
    function updateStats() {
        questionsCountElement.textContent = questionsCount;
        correctCountElement.textContent = correctCount;
        
        // Calculate and display accuracy percentage
        const accuracy = questionsCount > 0 ? Math.round((correctCount / questionsCount) * 100) : 0;
        accuracyPercentageElement.textContent = `${accuracy}%`;
    }
});

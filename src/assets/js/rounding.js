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
    let expectedSignificantDigits = 0;
    let trailingZerosCount = 0;
    
    // Initialize the game
    generateNewNumber();
    userAnswerInput.focus();
    
    // Add event listener for input to update as user types
    userAnswerInput.addEventListener('input', updateTrailingZeros);
    
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
        
        // Calculate how many significant digits we expect and how many zeros to display
        if (numDigits <= 2) {
            // Special case for 2-digit numbers - no rounding to single digit with zeroes
            expectedSignificantDigits = numDigits;
            trailingZerosCount = 0;
        } else {
            // For 3+ digit numbers use our normal rules
            expectedSignificantDigits = (numDigits <= 3) ? 1 : 2;
            trailingZerosCount = numDigits - expectedSignificantDigits;
        }
        
        // Calculate the correct rounded answer based on expected digits
        correctAnswer = calculateRoundedAnswer(currentNumber, numDigits);
        
        // Update trailing zeros display
        updateTrailingZerosDisplay();
        
        // Update input field size based on expected digits
        userAnswerInput.setAttribute('placeholder', '#');
        userAnswerInput.style.width = (expectedSignificantDigits * 18 + 10) + 'px'; 
    }
    
    function calculateRoundedAnswer(number, numDigits) {
        // For 2-digit numbers, don't round
        if (numDigits <= 2) {
            return number;
        }
        
        // For numbers with 3 digits, round to 1 significant digit
        // For numbers with 4-6 digits, round to 2 significant digits
        let sigDigits = (numDigits <= 3) ? 1 : 2;
        
        // Get the number of digits to round to
        const roundToDigit = Math.pow(10, numDigits - sigDigits);
        
        // Round the number
        return Math.round(number / roundToDigit) * roundToDigit;
    }
    
    function updateTrailingZerosDisplay() {
        const trailingZerosElement = document.getElementById('trailing-zeros');
        trailingZerosElement.textContent = '0'.repeat(trailingZerosCount);
    }
    
    function updateTrailingZeros() {
        // If user enters more digits than expected, trim it
        if (userAnswerInput.value.length > expectedSignificantDigits) {
            userAnswerInput.value = userAnswerInput.value.slice(0, expectedSignificantDigits);
        }
    }
    
    function checkAnswer() {
        // Get the significant digits entered by the user
        const userSignificantDigits = userAnswerInput.value.trim();
        
        // Validate input
        if (!userSignificantDigits || isNaN(parseInt(userSignificantDigits))) {
            feedbackElement.textContent = 'Please enter a valid number.';
            feedbackElement.className = 'feedback';
            return;
        }
        
        // Convert to full answer by adding zeros
        const userAnswer = parseInt(userSignificantDigits) * Math.pow(10, trailingZerosCount);
        
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
        
        // Find min and max values
        const minValue = Math.min(originalNumber, userGuess, correctAnswer);
        const maxValue = Math.max(originalNumber, userGuess, correctAnswer);
        
        // Ensure proper spacing by extending the range
        let rangeBuffer;
        
        // For numbers that are very close, create a more significant buffer
        if (maxValue - minValue < maxValue * 0.1) {
            // If range is less than 10% of the max value, extend it to at least 20% of max
            rangeBuffer = maxValue * 0.1;
        } else {
            // Otherwise, add 10% padding on each side
            rangeBuffer = (maxValue - minValue) * 0.1;
        }
        
        const displayMin = Math.max(0, minValue - rangeBuffer);
        const displayMax = maxValue + rangeBuffer;
        const displayRange = displayMax - displayMin;
        
        // Position the markers with better spacing
        const originalPos = ((originalNumber - displayMin) / displayRange) * 100;
        const guessPos = ((userGuess - displayMin) / displayRange) * 100;
        const correctPos = ((correctAnswer - displayMin) / displayRange) * 100;
        
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

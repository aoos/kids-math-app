import BaseGame from './BaseGame.js';

class RoundingGame extends BaseGame {
    constructor(container) {
        super({
            gameType: 'rounding',
            container
        });
        
        this.currentNumber = 0;
        this.correctAnswer = 0;
        this.expectedSignificantDigits = 0;
        this.trailingZerosCount = 0;
    }

    init() {
        super.init();
        
        // Get DOM references
        this.setupDomReferences();
        
        // Initialize game
        this.generateNewProblem();
        this.userAnswerInput.focus();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    getStatTitle(index) {
        const titles = ['Questions', 'Correct', 'Accuracy'];
        return titles[index] || 'Stat';
    }

    setupDomReferences() {
        this.targetNumberElement = document.getElementById('target-number');
        this.userAnswerInput = document.getElementById('user-answer');
        this.checkAnswerButton = document.getElementById('check-answer');
        this.nextNumberButton = document.getElementById('next-number');
        this.feedbackElement = document.getElementById('rounding-feedback');
        this.trailingZerosElement = document.getElementById('trailing-zeros');
        this.numberLineVisualization = document.getElementById('number-line-visualization');
        
        // Get difficulty checkbox references
        this.difficultyCheckboxes = {
            double: document.getElementById('double-digits'),
            triple: document.getElementById('triple-digits'),
            four: document.getElementById('four-digits'),
            five: document.getElementById('five-digits'),
            six: document.getElementById('six-digits')
        };
    }

    setupEventListeners() {
        this.userAnswerInput.addEventListener('input', () => this.updateTrailingZeros());
        
        this.checkAnswerButton.addEventListener('click', () => {
            this.checkAnswer();
            this.checkAnswerButton.style.display = 'none';
            this.nextNumberButton.style.display = 'inline-block';
        });
        
        this.nextNumberButton.addEventListener('click', () => {
            this.generateNewProblem();
            this.userAnswerInput.value = '';
            this.userAnswerInput.focus();
            this.feedbackElement.textContent = '';
            this.feedbackElement.className = 'feedback';
            this.numberLineVisualization.style.display = 'none';
            
            this.nextNumberButton.style.display = 'none';
            this.checkAnswerButton.style.display = 'inline-block';
        });
        
        this.userAnswerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (this.checkAnswerButton.style.display !== 'none') {
                    this.checkAnswer();
                    this.checkAnswerButton.style.display = 'none';
                    this.nextNumberButton.style.display = 'inline-block';
                } else if (this.nextNumberButton.style.display !== 'none') {
                    this.nextNumberButton.click();
                }
            }
        });
    }

    generateNewProblem() {
        // Check which difficulty options are selected
        const availableDigits = [];
        
        if (this.difficultyCheckboxes.double.checked) availableDigits.push(2);
        if (this.difficultyCheckboxes.triple.checked) availableDigits.push(3);
        if (this.difficultyCheckboxes.four.checked) availableDigits.push(4);
        if (this.difficultyCheckboxes.five.checked) availableDigits.push(5);
        if (this.difficultyCheckboxes.six.checked) availableDigits.push(6);
        
        // Default to all options if none selected
        if (availableDigits.length === 0) {
            availableDigits.push(2, 3, 4, 5, 6);
            
            // Update checkboxes to reflect this
            this.difficultyCheckboxes.double.checked = true;
            this.difficultyCheckboxes.triple.checked = true;
            this.difficultyCheckboxes.four.checked = true;
            this.difficultyCheckboxes.five.checked = true;
            this.difficultyCheckboxes.six.checked = true;
        }
        
        // Select a random number of digits
        const numDigits = availableDigits[Math.floor(Math.random() * availableDigits.length)];
        
        // Generate a random number with the selected number of digits
        const minValue = Math.pow(10, numDigits - 1);
        const maxValue = Math.pow(10, numDigits) - 1;
        this.currentNumber = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
        
        // Display the number with comma formatting
        this.targetNumberElement.textContent = this.currentNumber.toLocaleString();
        
        // Calculate how many significant digits we expect and how many zeros to display
        if (numDigits <= 2) {
            // Special case for 2-digit numbers - no rounding to single digit with zeroes
            this.expectedSignificantDigits = numDigits;
            this.trailingZerosCount = 0;
        } else {
            // For 3+ digit numbers use our normal rules
            this.expectedSignificantDigits = (numDigits <= 3) ? 1 : 2;
            this.trailingZerosCount = numDigits - this.expectedSignificantDigits;
        }
        
        // Calculate the correct rounded answer
        this.correctAnswer = this.calculateRoundedAnswer(this.currentNumber, numDigits);
        
        // Update trailing zeros display
        this.updateTrailingZerosDisplay();
        
        // Update input field size based on expected digits
        this.userAnswerInput.setAttribute('placeholder', '#');
        this.userAnswerInput.style.width = (this.expectedSignificantDigits * 18 + 10) + 'px';
    }

    updateTrailingZerosDisplay() {
        this.trailingZerosElement.textContent = '0'.repeat(this.trailingZerosCount);
    }

    updateTrailingZeros() {
        // If user enters more digits than expected, trim it
        if (this.userAnswerInput.value.length > this.expectedSignificantDigits) {
            this.userAnswerInput.value = this.userAnswerInput.value.slice(0, this.expectedSignificantDigits);
        }
    }

    calculateRoundedAnswer(number, numDigits) {
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

    checkAnswer() {
        // Get the significant digits entered by the user
        const userSignificantDigits = this.userAnswerInput.value.trim();
        
        // Validate input
        if (!userSignificantDigits || isNaN(parseInt(userSignificantDigits))) {
            this.showFeedback('Please enter a valid number.');
            return;
        }
        
        // Convert to full answer by adding zeros
        const userAnswer = parseInt(userSignificantDigits) * Math.pow(10, this.trailingZerosCount);
        
        // Check if answer is correct
        const isCorrect = userAnswer === this.correctAnswer;
        
        if (isCorrect) {
            this.showFeedback('Correct! Well done!', true);
            this.numberLineVisualization.style.display = 'none';
        } else {
            this.showFeedback(`Incorrect. The correct rounded value is ${this.correctAnswer.toLocaleString()}.`, false);
            this.showNumberLineVisualization(this.currentNumber, userAnswer, this.correctAnswer);
        }
        
        // Update stats
        super.updateStats(isCorrect);
    }

    showNumberLineVisualization(originalNumber, userGuess, correctAnswer) {
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
}

export default RoundingGame;

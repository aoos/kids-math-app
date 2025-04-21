import BaseGame from './BaseGame.js';

class NumberLinesGame extends BaseGame {
    constructor(container) {
        super({
            gameType: 'numberlines',
            container
        });
        
        this.minValue = 0;
        this.maxValue = 100;
        this.targetNumber = 0;
        this.hasGuessed = false;
        this.totalGuesses = 0;
        this.totalPercentageOff = 0;
        this.closestGuessPercentage = 100;
    }

    init() {
        super.init();
        
        // Get DOM references
        this.setupDomReferences();
        
        // Replace min/max labels with input fields
        this.setupRangeInputs();
        
        // Initialize game
        this.generateNewProblem();
        this.drawTickMarks(false);
        
        // Setup event listeners
        this.setupEventListeners();
    }

    getStatTitle(index) {
        const titles = ['Guesses', 'Average', 'Closest'];
        return titles[index] || 'Stat';
    }

    setupDomReferences() {
        this.minLabel = document.getElementById('min-label');
        this.maxLabel = document.getElementById('max-label');
        this.randomizeCheckbox = document.getElementById('randomize');
        this.decimalsCheckbox = document.getElementById('decimals');
        this.negativesCheckbox = document.getElementById('negatives');
        this.largeNumbersCheckbox = document.getElementById('large-numbers');
        this.targetNumberElement = document.getElementById('target-number');
        this.numberLine = document.getElementById('number-line');
        this.userMarker = document.getElementById('user-marker');
        this.correctMarker = document.getElementById('correct-marker');
        this.resultsDiv = document.getElementById('results');
        this.starsDiv = document.getElementById('stars');
        this.accuracyDiv = document.getElementById('accuracy');
        this.nextButton = document.getElementById('next-number');
        this.tickContainer = document.getElementById('tick-marks');
    }

    setupRangeInputs() {
        this.minLabel.innerHTML = `<input type="number" id="min-value" value="0">`;
        this.maxLabel.innerHTML = `<input type="number" id="max-value" value="100">`;
        
        this.minInput = document.getElementById('min-value');
        this.maxInput = document.getElementById('max-value');
    }

    setupEventListeners() {
        // Input change events
        this.minInput.addEventListener('change', () => {
            this.minValue = parseFloat(this.minInput.value);
            if (this.minValue >= this.maxValue) {
                this.maxInput.value = this.minValue + 10;
                this.maxValue = this.minValue + 10;
            }
            this.generateNewProblem();
            this.drawTickMarks(this.hasGuessed);
        });
        
        this.maxInput.addEventListener('change', () => {
            this.maxValue = parseFloat(this.maxInput.value);
            if (this.maxValue <= this.minValue) {
                this.minInput.value = this.maxValue - 10;
                this.minValue = this.maxValue - 10;
            }
            this.generateNewProblem();
            this.drawTickMarks(this.hasGuessed);
        });
        
        // Checkbox events
        this.decimalsCheckbox.addEventListener('change', () => this.generateNewProblem());
        
        this.largeNumbersCheckbox.addEventListener('change', () => {
            if (this.largeNumbersCheckbox.checked) {
                this.setLargeNumbersRange();
            } else {
                const defaultMin = this.negativesCheckbox.checked ? -100 : 0;
                this.minInput.value = defaultMin;
                this.maxInput.value = defaultMin + 100;
                this.minValue = defaultMin;
                this.maxValue = defaultMin + 100;
            }
            this.generateNewProblem();
            this.drawTickMarks(this.hasGuessed);
        });
        
        // Number line click event
        this.numberLine.addEventListener('click', (e) => this.handleNumberLineClick(e));
        
        // Next button event
        this.nextButton.addEventListener('click', () => {
            if (this.randomizeCheckbox.checked) {
                this.randomizeRange();
            }
            this.generateNewProblem();
            this.resetGame();
        });
    }

    handleNumberLineClick(e) {
        if (this.hasGuessed) return;
        
        // Calculate click position as percentage of line width
        const rect = this.numberLine.getBoundingClientRect();
        const clickPosition = e.clientX - rect.left;
        const percentage = clickPosition / rect.width;
        
        // Calculate corresponding number value
        const guessedValue = this.minValue + (this.maxValue - this.minValue) * percentage;
        
        // Show user marker
        this.userMarker.style.display = 'block';
        this.userMarker.style.left = `${percentage * 100}%`;
        
        // Show correct marker
        const correctPercentage = (this.targetNumber - this.minValue) / (this.maxValue - this.minValue);
        this.correctMarker.style.display = 'block';
        this.correctMarker.style.left = `${correctPercentage * 100}%`;
        
        // Now reveal all tick marks
        this.drawTickMarks(true);
        
        // Calculate accuracy and show results
        const percentageDifference = Math.abs(percentage - correctPercentage) * 100;
        this.showResults(percentage, correctPercentage, percentageDifference);
        
        // Update stats
        this.totalGuesses++;
        this.totalPercentageOff += percentageDifference;
        this.closestGuessPercentage = Math.min(this.closestGuessPercentage, percentageDifference);
        this.updateNumberLineStats();
        
        this.hasGuessed = true;
    }

    updateNumberLineStats() {
        document.getElementById('numberlines-stat-1').textContent = this.totalGuesses;
        document.getElementById('numberlines-stat-2').textContent = 
            (this.totalGuesses > 0) ? `${(this.totalPercentageOff / this.totalGuesses).toFixed(1)}%` : '0%';
        document.getElementById('numberlines-stat-3').textContent = 
            (this.closestGuessPercentage < 100) ? `${this.closestGuessPercentage.toFixed(1)}%` : 'N/A';
    }

    generateNewProblem() {
        const useDecimals = this.decimalsCheckbox.checked;
        const range = this.maxValue - this.minValue;
        
        if (useDecimals) {
            this.targetNumber = this.minValue + Math.random() * range;
            this.targetNumberElement.textContent = this.formatNumber(this.targetNumber);
        } else {
            this.targetNumber = Math.floor(this.minValue + Math.random() * (range + 1));
            this.targetNumberElement.textContent = this.formatLargeNumber(this.targetNumber);
        }
    }

    formatNumber(num) {
        if (this.decimalsCheckbox.checked) {
            return num.toFixed(1);
        } else {
            return Math.floor(num);
        }
    }

    formatLargeNumber(num) {
        if (this.largeNumbersCheckbox.checked && Math.abs(num) >= 1000) {
            return num.toLocaleString();
        }
        return num;
    }

    drawTickMarks(showTicks = false) {
        this.tickContainer.innerHTML = '';
        
        if (!showTicks) return;
        
        for (let i = 1; i <= 9; i++) {
            const tick = document.createElement('div');
            tick.className = 'tick-mark';
            tick.style.left = `${i * 10}%`;
            
            const label = document.createElement('div');
            label.className = 'tick-label';
            
            const value = this.minValue + (this.maxValue - this.minValue) * (i / 10);
            label.textContent = this.formatNumber(value);
            
            if (i === 5) {
                tick.classList.add('major-tick');
            } else if (i === 2 || i === 7) {
                tick.classList.add('medium-tick');
                label.classList.add('medium-label');
            } else {
                label.classList.add('smaller-label');
            }
            
            tick.appendChild(label);
            this.tickContainer.appendChild(tick);
        }
    }

    showResults(userPercentage, correctPercentage, percentageDifference) {
        let stars = '';
        let message = '';
        
        if (percentageDifference <= 10) {
            stars = '⭐⭐⭐';
            message = "Amazing! Great job!";
        } else if (percentageDifference <= 20) {
            stars = '⭐⭐';
            message = "Good work! Getting closer!";
        } else if (percentageDifference <= 30) {
            stars = '⭐';
            message = "Nice try! Keep practicing!";
        } else {
            message = "Keep trying! You'll get better with practice!";
        }
        
        this.starsDiv.textContent = stars;
        this.accuracyDiv.innerHTML = `${message}<br>You were ${percentageDifference.toFixed(1)}% away from the exact spot`;
        this.resultsDiv.style.display = 'block';
        
        this.userMarker.classList.add('marker-animation');
        this.correctMarker.classList.add('marker-animation');
        
        setTimeout(() => {
            this.userMarker.classList.remove('marker-animation');
            this.correctMarker.classList.remove('marker-animation');
        }, 500);
    }

    resetGame() {
        this.userMarker.style.display = 'none';
        this.correctMarker.style.display = 'none';
        this.resultsDiv.style.display = 'none';
        this.hasGuessed = false;
        this.drawTickMarks(false);
    }

    randomizeRange() {
        let newMin, rangeSize;
        
        if (this.largeNumbersCheckbox.checked) {
            // Generate large numbers with rounded values
            const magnitudes = [
                { min: 1_000, max: 10_000 },
                { min: 10_000, max: 100_000 },
                { min: 100_000, max: 1_000_000 }
            ];
            
            const magnitude = magnitudes[Math.floor(Math.random() * magnitudes.length)];
            
            // Generate min value as a round number with 1-2 significant digits
            const significantDigits = Math.random() < 0.5 ? 1 : 2;
            const baseNumber = significantDigits === 1 ? 
                (Math.floor(Math.random() * 9) + 1) : 
                (Math.floor(Math.random() * 90) + 10);
            
            // Calculate the order of magnitude
            const orderMagnitude = Math.floor(Math.log10(magnitude.min));
            
            // Create the rounded min value
            newMin = baseNumber * Math.pow(10, orderMagnitude - (significantDigits - 1));
            
            // Create a round range size
            const rangeSigDigits = Math.random() < 0.5 ? 1 : 2;
            const rangeBase = rangeSigDigits === 1 ? 
                (Math.floor(Math.random() * 9) + 1) : 
                (Math.floor(Math.random() * 90) + 10);
                
            rangeSize = rangeBase * Math.pow(10, orderMagnitude - (rangeSigDigits - 1));
            
            // Ensure range isn't too small or too large
            if (rangeSize < magnitude.min * 0.1) {
                rangeSize = magnitude.min * 0.1;
            } else if (rangeSize > magnitude.max * 0.9) {
                rangeSize = magnitude.max * 0.9;
            }
        } else {
            // Standard range generation with round numbers
            const baseMin = Math.floor(Math.random() * 9) + 1; // 1-9
            const baseMax = baseMin + Math.floor(Math.random() * 9) + 1; // baseMin + (1-9)
            
            // Determine multiplier (10 or 100)
            const multiplier = Math.random() < 0.7 ? 10 : 100;
            
            if (this.negativesCheckbox.checked && Math.random() > 0.5) {
                newMin = -baseMin * multiplier;
            } else {
                newMin = baseMin * multiplier;
            }
            
            rangeSize = (baseMax - baseMin) * multiplier;
        }
        
        // Allow negatives if checkbox is checked
        if (this.negativesCheckbox.checked && Math.random() > 0.5 && !this.largeNumbersCheckbox.checked) {
            newMin = -newMin;
        }
        
        const newMax = newMin + rangeSize;
        
        this.minInput.value = newMin;
        this.maxInput.value = newMax;
        this.minValue = newMin;
        this.maxValue = newMax;
        this.drawTickMarks(this.hasGuessed);
    }

    setLargeNumbersRange() {
        // Set a default large number range with round numbers
        const magnitudeValues = [1_000, 10_000, 100_000];
        const magnitude = magnitudeValues[Math.floor(Math.random() * magnitudeValues.length)];
        
        // Create a round number with 1-2 significant digits
        const significantDigits = Math.random() < 0.5 ? 1 : 2;
        const baseNumber = significantDigits === 1 ? 
            (Math.floor(Math.random() * 9) + 1) : 
            (Math.floor(Math.random() * 90) + 10);
        
        // Calculate the order of magnitude
        const orderMagnitude = Math.floor(Math.log10(magnitude));
        
        // Create the rounded min value
        let newMin = baseNumber * Math.pow(10, orderMagnitude - (significantDigits - 1));
        
        // Create a round range size with 1-2 significant digits
        const rangeSigDigits = Math.random() < 0.5 ? 1 : 2;
        const rangeBase = rangeSigDigits === 1 ? 
            (Math.floor(Math.random() * 9) + 1) : 
            (Math.floor(Math.random() * 90) + 10);
            
        const rangeSize = rangeBase * Math.pow(10, orderMagnitude - (rangeSigDigits - 1));
        
        if (this.negativesCheckbox.checked && Math.random() > 0.5) {
            newMin = -newMin;
        }
        
        this.minInput.value = newMin;
        this.maxInput.value = newMin + rangeSize;
        this.minValue = newMin;
        this.maxValue = newMin + rangeSize;
    }
}

export default NumberLinesGame;

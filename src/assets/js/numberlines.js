document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const minLabel = document.getElementById('min-label');
    const maxLabel = document.getElementById('max-label');
    const randomizeCheckbox = document.getElementById('randomize');
    const decimalsCheckbox = document.getElementById('decimals');
    const negativesCheckbox = document.getElementById('negatives');
    const targetNumberElement = document.getElementById('target-number');
    const numberLine = document.getElementById('number-line');
    const userMarker = document.getElementById('user-marker');
    const correctMarker = document.getElementById('correct-marker');
    const resultsDiv = document.getElementById('results');
    const starsDiv = document.getElementById('stars');
    const accuracyDiv = document.getElementById('accuracy');
    const nextButton = document.getElementById('next-number');
    const tickContainer = document.getElementById('tick-marks');
    
    // Replace the static labels with input fields
    minLabel.innerHTML = `<input type="number" id="min-value" value="0">`;
    maxLabel.innerHTML = `<input type="number" id="max-value" value="100">`;
    
    // Get references to the new input fields
    const minInput = document.getElementById('min-value');
    const maxInput = document.getElementById('max-value');
    
    // Game state
    let minValue = parseInt(minInput.value, 10);
    let maxValue = parseInt(maxInput.value, 10);
    let targetNumber = 0;
    let hasGuessed = false;
    
    // Stats tracking variables
    let totalGuesses = 0;
    let totalPercentageOff = 0;
    let closestGuessPercentage = 100; // Initialize with worst possible value
    
    // Create stats display element
    const statsDiv = document.createElement('div');
    statsDiv.className = 'stats-container';
    statsDiv.innerHTML = `
        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-title">Guesses</div>
                <div id="guesses-count" class="stat-value">0</div>
            </div>
            <div class="stat-box">
                <div class="stat-title">Average</div>
                <div id="average-percentage" class="stat-value">0%</div>
            </div>
            <div class="stat-box">
                <div class="stat-title">Closest</div>
                <div id="closest-guess" class="stat-value">N/A</div>
            </div>
        </div>
    `;
    document.querySelector('.container').appendChild(statsDiv);
    
    // Initialize game
    generateNewTarget();
    drawTickMarks(false); // Don't show any tick marks initially
    
    // Event listeners
    minInput.addEventListener('change', () => {
        minValue = parseFloat(minInput.value);
        if (minValue >= maxValue) {
            maxInput.value = minValue + 10;
            maxValue = minValue + 10;
        }
        generateNewTarget();
        drawTickMarks(hasGuessed);
    });
    
    maxInput.addEventListener('change', () => {
        maxValue = parseFloat(maxInput.value);
        if (maxValue <= minValue) {
            minInput.value = maxValue - 10;
            minValue = maxValue - 10;
        }
        generateNewTarget();
        drawTickMarks(hasGuessed);
    });
    
    decimalsCheckbox.addEventListener('change', generateNewTarget);
    
    numberLine.addEventListener('click', (e) => {
        if (hasGuessed) return;
        
        // Calculate click position as percentage of line width
        const rect = numberLine.getBoundingClientRect();
        const clickPosition = e.clientX - rect.left;
        const percentage = clickPosition / rect.width;
        
        // Calculate corresponding number value
        const guessedValue = minValue + (maxValue - minValue) * percentage;
        
        // Show user marker
        userMarker.style.display = 'block';
        userMarker.style.left = `${percentage * 100}%`;
        
        // Show correct marker
        const correctPercentage = (targetNumber - minValue) / (maxValue - minValue);
        correctMarker.style.display = 'block';
        correctMarker.style.left = `${correctPercentage * 100}%`;
        
        // Now reveal all tick marks
        drawTickMarks(true);
        
        // Calculate accuracy and show results
        const percentageDifference = Math.abs(percentage - correctPercentage) * 100;
        showResults(percentage, correctPercentage, percentageDifference);
        
        // Update stats
        totalGuesses++;
        totalPercentageOff += percentageDifference;
        closestGuessPercentage = Math.min(closestGuessPercentage, percentageDifference);
        updateStats();
        
        hasGuessed = true;
    });
    
    nextButton.addEventListener('click', () => {
        if (randomizeCheckbox.checked) {
            randomizeRange();
        }
        generateNewTarget();
        resetGame();
    });
    
    function updateLabels() {
        // Don't update the input values here as they're directly editable
        drawTickMarks(hasGuessed);
    }
    
    function generateNewTarget() {
        const useDecimals = decimalsCheckbox.checked;
        const range = maxValue - minValue;
        
        if (useDecimals) {
            targetNumber = minValue + Math.random() * range;
            targetNumberElement.textContent = formatNumber(targetNumber);
        } else {
            targetNumber = Math.floor(minValue + Math.random() * (range + 1));
            targetNumberElement.textContent = targetNumber;
        }
    }
    
    function formatNumber(num) {
        return decimalsCheckbox.checked ? num.toFixed(1) : Math.floor(num);
    }
    
    function drawTickMarks(showTicks = false) {
        tickContainer.innerHTML = '';
        
        // Only draw tick marks if showTicks is true
        if (!showTicks) return;
        
        // Create 9 tick marks (dividing the line into 10 equal parts)
        for (let i = 1; i <= 9; i++) {
            const tick = document.createElement('div');
            tick.className = 'tick-mark';
            tick.style.left = `${i * 10}%`;
            
            // Add labels for all tick marks
            const label = document.createElement('div');
            label.className = 'tick-label';
            
            // Calculate the value at this position
            const value = minValue + (maxValue - minValue) * (i / 10);
            label.textContent = formatNumber(value);
            
            // Add appropriate styling based on position
            if (i === 5) {
                tick.classList.add('major-tick');
            } else if (i === 2 || i === 7) {
                tick.classList.add('medium-tick');
                label.classList.add('medium-label');
            } else {
                label.classList.add('smaller-label');
            }
            
            tick.appendChild(label);
            tickContainer.appendChild(tick);
        }
    }
    
    function showResults(userPercentage, correctPercentage, percentageDifference) {
        // Determine number of stars
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
        
        // Show results
        starsDiv.textContent = stars;
        accuracyDiv.innerHTML = `${message}<br>You were ${percentageDifference.toFixed(1)}% away from the exact spot`;
        resultsDiv.style.display = 'block';
        
        // Add animation to markers
        userMarker.classList.add('marker-animation');
        correctMarker.classList.add('marker-animation');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            userMarker.classList.remove('marker-animation');
            correctMarker.classList.remove('marker-animation');
        }, 500);
    }
    
    function updateStats() {
        document.getElementById('guesses-count').textContent = totalGuesses;
        document.getElementById('average-percentage').textContent = 
            (totalGuesses > 0) ? `${(totalPercentageOff / totalGuesses).toFixed(1)}%` : '0%';
        document.getElementById('closest-guess').textContent = 
            (closestGuessPercentage < 100) ? `${closestGuessPercentage.toFixed(1)}%` : 'N/A';
    }
    
    function resetGame() {
        userMarker.style.display = 'none';
        correctMarker.style.display = 'none';
        resultsDiv.style.display = 'none';
        hasGuessed = false;
        // Hide all tick marks
        drawTickMarks(false);
    }
    
    function randomizeRange() {
        // Generate random range respecting the negatives checkbox
        let newMin;
        if (negativesCheckbox.checked) {
            // Allow negative minimum values if negatives checkbox is checked
            newMin = Math.floor(Math.random() * 200) - 100;
        } else {
            // Only positive minimum values if negatives checkbox is not checked
            newMin = Math.floor(Math.random() * 100);
        }
        
        const rangeSize = Math.floor(Math.random() * 180) + 20; // Range between 20 and 200
        const newMax = newMin + rangeSize;
        
        minInput.value = newMin;
        maxInput.value = newMax;
        minValue = newMin;
        maxValue = newMax;
        drawTickMarks(hasGuessed);
    }
});
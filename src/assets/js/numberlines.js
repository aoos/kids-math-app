document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const minInput = document.getElementById('min-value');
    const maxInput = document.getElementById('max-value');
    const minLabel = document.getElementById('min-label');
    const maxLabel = document.getElementById('max-label');
    const randomizeCheckbox = document.getElementById('randomize');
    const decimalsCheckbox = document.getElementById('decimals');
    const targetNumberElement = document.getElementById('target-number');
    const numberLine = document.getElementById('number-line');
    const userMarker = document.getElementById('user-marker');
    const correctMarker = document.getElementById('correct-marker');
    const resultsDiv = document.getElementById('results');
    const starsDiv = document.getElementById('stars');
    const accuracyDiv = document.getElementById('accuracy');
    const nextButton = document.getElementById('next-number');
    const tickContainer = document.getElementById('tick-marks');
    const homeButton = document.getElementById('home-button');
    
    // Game state
    let minValue = parseInt(minInput.value, 10);
    let maxValue = parseInt(maxInput.value, 10);
    let targetNumber = 0;
    let hasGuessed = false;
    
    // Initialize game
    generateNewTarget();
    updateLabels();
    drawTickMarks(false); // Initialize without showing tick marks
    
    // Event listeners
    minInput.addEventListener('change', () => {
        minValue = parseFloat(minInput.value);
        updateLabels();
        if (minValue >= maxValue) {
            maxInput.value = minValue + 10;
            maxValue = minValue + 10;
            updateLabels();
        }
        generateNewTarget();
    });
    
    maxInput.addEventListener('change', () => {
        maxValue = parseFloat(maxInput.value);
        updateLabels();
        if (maxValue <= minValue) {
            minInput.value = maxValue - 10;
            minValue = maxValue - 10;
            updateLabels();
        }
        generateNewTarget();
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
        
        // Now reveal the tick marks and halfway mark
        drawTickMarks(true);
        
        // Calculate accuracy and show results
        showResults(percentage, correctPercentage);
        
        hasGuessed = true;
    });
    
    nextButton.addEventListener('click', () => {
        if (randomizeCheckbox.checked) {
            randomizeRange();
        }
        generateNewTarget();
        resetGame();
    });
    
    homeButton.addEventListener('click', () => {
        window.location.href = '../index.html';  // Change from '/' to '../index.html'
    });
    
    function updateLabels() {
        minLabel.textContent = formatNumber(minValue);
        maxLabel.textContent = formatNumber(maxValue);
        // Only draw tick marks without labels when updating
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
    
    function drawTickMarks(showLabels = false) {
        tickContainer.innerHTML = '';
        
        // Create 9 tick marks (dividing the line into 10 equal parts)
        for (let i = 1; i <= 9; i++) {
            const tick = document.createElement('div');
            tick.className = 'tick-mark';
            tick.style.left = `${i * 10}%`;
            
            // Only show middle tick label if showLabels is true
            if (i === 5 && showLabels) {
                const label = document.createElement('div');
                label.className = 'tick-label';
                const middleValue = minValue + (maxValue - minValue) * 0.5;
                label.textContent = formatNumber(middleValue);
                tick.appendChild(label);
                tick.classList.add('major-tick');
            } else if (i === 2 || i === 7) {
                // Make these medium ticks, but don't add labels
                tick.classList.add('medium-tick');
            }
            
            // Only add the tick mark to the container if we're showing labels
            // or if it's not the middle tick that would reveal information
            if (showLabels || (i !== 5)) {
                tickContainer.appendChild(tick);
            }
        }
    }
    
    function showResults(userPercentage, correctPercentage) {
        const percentageDifference = Math.abs(userPercentage - correctPercentage) * 100;
        
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
    
    function resetGame() {
        userMarker.style.display = 'none';
        correctMarker.style.display = 'none';
        resultsDiv.style.display = 'none';
        hasGuessed = false;
        // Reset tick marks to hide the labels
        drawTickMarks(false);
    }
    
    function randomizeRange() {
        // Generate random range (min between -100 and 100, max is min + 20 to min + 200)
        const newMin = Math.floor(Math.random() * 200) - 100;
        const rangeSize = Math.floor(Math.random() * 180) + 20; // Range between 20 and 200
        const newMax = newMin + rangeSize;
        
        minInput.value = newMin;
        maxInput.value = newMax;
        minValue = newMin;
        maxValue = newMax;
        updateLabels();
    }
});
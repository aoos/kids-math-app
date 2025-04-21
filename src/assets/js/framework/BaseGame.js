/**
 * Base Game class that provides common functionality for all math games
 */
class BaseGame {
    /**
     * @param {Object} config - Configuration object
     * @param {string} config.gameType - Type of game (e.g., 'numberlines', 'rounding')
     * @param {HTMLElement} config.container - Container element for the game
     */
    constructor(config) {
        this.gameType = config.gameType;
        this.container = config.container;
        this.stats = {
            attempts: 0,
            correct: 0,
            bestScore: 0
        };
        this.isInitialized = false;
    }

    /**
     * Initialize the game
     */
    init() {
        if (this.isInitialized) return;
        
        this.createStatsContainer();
        this.setupHomeButton();
        this.registerEventListeners();
        this.isInitialized = true;
    }

    /**
     * Create the statistics container
     */
    createStatsContainer() {
        const statsDiv = document.createElement('div');
        statsDiv.className = 'stats-container';
        statsDiv.innerHTML = `
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-title">${this.getStatTitle(0)}</div>
                    <div id="${this.gameType}-stat-1" class="stat-value">0</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">${this.getStatTitle(1)}</div>
                    <div id="${this.gameType}-stat-2" class="stat-value">0</div>
                </div>
                <div class="stat-box">
                    <div class="stat-title">${this.getStatTitle(2)}</div>
                    <div id="${this.gameType}-stat-3" class="stat-value">0%</div>
                </div>
            </div>
        `;
        this.container.appendChild(statsDiv);
    }

    /**
     * Get the title for a stat box
     * @param {number} index - Index of the stat box
     * @returns {string} - Title for the stat box
     */
    getStatTitle(index) {
        const titles = ['Attempts', 'Correct', 'Accuracy'];
        return titles[index] || 'Stat';
    }

    /**
     * Set up the home button
     */
    setupHomeButton() {
        // Check if a home button already exists
        if (this.container.querySelector('.home-icon-container')) {
            return; // Skip adding if it already exists
        }
        
        const homeDiv = document.createElement('div');
        homeDiv.className = 'home-icon-container';
        homeDiv.innerHTML = `
            <a href="../index.html" class="home-icon" title="Return to Home">
                <i class="fas fa-home"></i>
            </a>
        `;
        this.container.prepend(homeDiv);
    }

    /**
     * Register common event listeners
     */
    registerEventListeners() {
        // Override in subclass
    }

    /**
     * Update game statistics
     * @param {boolean} isCorrect - Whether the answer was correct
     */
    updateStats(isCorrect) {
        this.stats.attempts++;
        if (isCorrect) this.stats.correct++;
        
        document.getElementById(`${this.gameType}-stat-1`).textContent = this.stats.attempts;
        document.getElementById(`${this.gameType}-stat-2`).textContent = this.stats.correct;
        
        const accuracy = this.stats.attempts > 0 ? 
            Math.round((this.stats.correct / this.stats.attempts) * 100) : 0;
        document.getElementById(`${this.gameType}-stat-3`).textContent = `${accuracy}%`;
        
        // Save stats to localStorage
        this.saveStats();
    }

    /**
     * Save game statistics to localStorage
     */
    saveStats() {
        if (window.storageWithTTL) {
            window.storageWithTTL.setWithTTL(
                `${this.gameType}-stats`,
                this.stats
            );
        }
    }

    /**
     * Load game statistics from localStorage
     */
    loadStats() {
        if (window.storageWithTTL) {
            const savedStats = window.storageWithTTL.getWithTTL(`${this.gameType}-stats`);
            if (savedStats) {
                this.stats = savedStats;
                this.updateStatsDisplay();
            }
        }
    }

    /**
     * Update the stats display
     */
    updateStatsDisplay() {
        document.getElementById(`${this.gameType}-stat-1`).textContent = this.stats.attempts;
        document.getElementById(`${this.gameType}-stat-2`).textContent = this.stats.correct;
        
        const accuracy = this.stats.attempts > 0 ? 
            Math.round((this.stats.correct / this.stats.attempts) * 100) : 0;
        document.getElementById(`${this.gameType}-stat-3`).textContent = `${accuracy}%`;
    }

    /**
     * Show feedback to the user
     * @param {string} message - Feedback message
     * @param {boolean} isCorrect - Whether the answer was correct
     */
    showFeedback(message, isCorrect = null) {
        const feedbackElement = document.getElementById(`${this.gameType}-feedback`);
        if (!feedbackElement) return;
        
        feedbackElement.textContent = message;
        feedbackElement.className = 'feedback';
        
        if (isCorrect === true) {
            feedbackElement.classList.add('correct');
        } else if (isCorrect === false) {
            feedbackElement.classList.add('incorrect');
        }
    }

    /**
     * Generate a new problem
     */
    generateNewProblem() {
        // Override in subclass
    }
}

export default BaseGame;

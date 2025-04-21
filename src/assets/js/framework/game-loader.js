import NumberLinesGame from './NumberLinesGame.js';
import RoundingGame from './RoundingGame.js';

/**
 * Initialize the appropriate game based on the current page
 */
function initializeGame() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    const path = window.location.pathname;
    
    if (path.includes('numberlines')) {
        const game = new NumberLinesGame(container);
        game.init();
        window.currentGame = game;
    } else if (path.includes('rounding')) {
        const game = new RoundingGame(container);
        game.init();
        window.currentGame = game;
    }
    // Add more games here as they are developed
}

document.addEventListener('DOMContentLoaded', initializeGame);

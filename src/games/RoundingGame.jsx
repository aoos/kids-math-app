import React, { useState, useEffect } from 'react';
import GameStats from '../components/GameStats';

function RoundingGame() {
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  useEffect(() => {
    // Logic for updating totalQuestions and correctAnswers
  }, []);

  return (
    <div className="rounding-game">
      <h2>Rounding Numbers Game</h2>
      
      {/* Game content */}
      <div className="game-content">
        {/* Add game logic and UI here */}
      </div>
      
      {/* Single statistics section using the shared component */}
      <GameStats 
        totalQuestions={totalQuestions} 
        correctAnswers={correctAnswers} 
      />
    </div>
  );
}

export default RoundingGame;
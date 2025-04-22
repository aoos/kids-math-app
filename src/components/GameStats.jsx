import React from 'react';

function GameStats({ totalQuestions, correctAnswers }) {
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  return (
    <div className="game-stats">
      <p>Questions: {totalQuestions}</p>
      <p>Correct: {correctAnswers}</p>
      <p>Accuracy: {accuracy}%</p>
    </div>
  );
}

export default GameStats;

export function playCorrectSound() {
    const audio = new Audio('path/to/correct-sound.mp3');
    audio.play();
}

export function playIncorrectSound() {
    const audio = new Audio('path/to/incorrect-sound.mp3');
    audio.play();
}
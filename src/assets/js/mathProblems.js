function generateAdditionProblem() {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    return {
        question: `${num1} + ${num2}`,
        answer: num1 + num2
    };
}

function generateSubtractionProblem() {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    return {
        question: `${num1} - ${num2}`,
        answer: num1 - num2
    };
}

function generateMultiplicationProblem() {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    return {
        question: `${num1} * ${num2}`,
        answer: num1 * num2
    };
}

function generateDivisionProblem() {
    const num2 = Math.floor(Math.random() * 9) + 1; // Avoid division by zero
    const num1 = num2 * Math.floor(Math.random() * 10);
    return {
        question: `${num1} / ${num2}`,
        answer: num1 / num2
    };
}

export { generateAdditionProblem, generateSubtractionProblem, generateMultiplicationProblem, generateDivisionProblem };
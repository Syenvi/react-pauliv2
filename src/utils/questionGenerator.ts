import { Question } from '../types/test';

export function generateQuestion(): Question {
  const num1 = Math.floor(Math.random() * 10);
  const num2 = Math.floor(Math.random() * 10);
  const operation = '+'; // Pauli test traditionally uses addition only
  
  const fullAnswer = num1 + num2;
  const correctAnswer = fullAnswer % 10; // Only take the last digit
  
  return {
    id: `${Date.now()}_${Math.random()}`,
    num1,
    num2,
    operation,
    correctAnswer
  };
}

export function generateQuestions(count: number = 200): Question[] {
  return Array.from({ length: count }, () => generateQuestion());
}
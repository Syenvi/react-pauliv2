import { Question } from '../types/test';

// Pre-generate 4000 questions at startup for better performance and stability
let preGeneratedQuestions: Question[] = [];

function generateSingleQuestion(index: number): Question {
  // Use index as seed for consistent but varied questions
  const seed1 = (index * 7 + 13) % 10;
  const seed2 = (index * 11 + 17) % 10;
  
  const num1 = seed1;
  const num2 = seed2;
  const operation = '+'; // Pauli test traditionally uses addition only
  
  const fullAnswer = num1 + num2;
  const correctAnswer = fullAnswer % 10; // Only take the last digit
  
  return {
    id: `q_${index}`,
    num1,
    num2,
    operation,
    correctAnswer
  };
}

// Initialize 4000 questions on module load
function initializeQuestions() {
  if (preGeneratedQuestions.length === 0) {
    console.log('Generating 4000 questions...');
    preGeneratedQuestions = Array.from({ length: 4000 }, (_, index) => 
      generateSingleQuestion(index)
    );
    console.log('4000 questions generated successfully!');
  }
}

// Initialize immediately
initializeQuestions();

export function getAllQuestions(): Question[] {
  return preGeneratedQuestions;
}

export function getQuestionsSlice(start: number, count: number): Question[] {
  return preGeneratedQuestions.slice(start, start + count);
}

export function getTotalQuestionsCount(): number {
  return preGeneratedQuestions.length;
}

// Legacy function for compatibility - now returns slice of pre-generated questions
export function generateQuestions(count: number = 200): Question[] {
  return preGeneratedQuestions.slice(0, Math.min(count, preGeneratedQuestions.length));
}

// Get questions for a specific session with different starting points
export function getSessionQuestions(sessionNumber: number, questionsPerSession: number = 1000): Question[] {
  const startIndex = (sessionNumber - 1) * questionsPerSession;
  return preGeneratedQuestions.slice(startIndex, startIndex + questionsPerSession);
}
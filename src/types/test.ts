export interface Answer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  wasChanged: boolean;
  timestamp: number;
}

export interface Question {
  id: string;
  num1: number;
  num2: number;
  operation: '+' | '-';
  correctAnswer: number;
}

export interface SessionData {
  sessionNumber: number;
  questions: Question[];
  answers: Answer[];
  startTime: number;
  endTime?: number;
  totalAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  corrections: number;
}

export interface TestConfig {
  sessionDuration: number; // in seconds
  totalSessions: number;
}

export interface TestState {
  isActive: boolean;
  currentSession: number;
  timeRemaining: number;
  sessions: SessionData[];
  isCompleted: boolean;
  config: TestConfig;
}
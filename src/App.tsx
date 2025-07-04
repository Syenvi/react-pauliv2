import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StartScreen } from './components/StartScreen';
import { Timer } from './components/Timer';
import { QuestionCard } from './components/QuestionCard';
import { SessionResults } from './components/SessionResults';
import { MobileKeyboard } from './components/MobileKeyboard';
import { MobileQuestionGrid } from './components/MobileQuestionGrid';
import { useTimer } from './hooks/useTimer';
import { generateQuestions, generateMoreQuestions } from './utils/questionGenerator';
import { TestState, SessionData, Answer, TestConfig } from './types/test';
import { RotateCcw } from 'lucide-react';

function App() {
  const [testState, setTestState] = useState<TestState>({
    isActive: false,
    currentSession: 0,
    timeRemaining: 0,
    sessions: [],
    isCompleted: false,
    config: {
      sessionDuration: 30,
      totalSessions: 4
    }
  });
  
  // Start with initial questions and generate more as needed
  const [currentQuestions, setCurrentQuestions] = useState(generateQuestions(1000));
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [previousSession, setPreviousSession] = useState<number>(0);
  
  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Auto-generate more questions when approaching the end
  useEffect(() => {
    const questionsNeeded = isMobile ? 
      Math.ceil((currentQuestionIndex + 1) / 75) * 75 : // Mobile: ensure we have enough for current 3-column set
      Math.ceil((currentQuestionIndex + 1) / 300) * 300; // Desktop: ensure we have enough for current 12-column set
    
    if (currentQuestions.length < questionsNeeded + 300) {
      setCurrentQuestions(prev => generateMoreQuestions(prev, 500));
    }
  }, [currentQuestionIndex, isMobile, currentQuestions.length]);
  
  // Auto-scroll to top when session changes
  useEffect(() => {
    if (testState.currentSession !== previousSession && testState.isActive) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setPreviousSession(testState.currentSession);
      setCurrentQuestionIndex(0);
      
      // Focus on first input after scroll (desktop only)
      if (!isMobile) {
        setTimeout(() => {
          const firstInput = document.querySelector('input[type="text"]') as HTMLInputElement;
          if (firstInput) {
            firstInput.focus();
          }
        }, 500);
      }
    }
  }, [testState.currentSession, previousSession, testState.isActive, isMobile]);
  
  const handleSessionComplete = useCallback(() => {
    // Calculate stats properly
    const answeredQuestions = currentAnswers.filter(a => a.answer !== '');
    const correctAnswers = currentAnswers.filter(a => a.isCorrect && a.answer !== '');
    const corrections = currentAnswers.filter(a => a.wasChanged);
    const wrongAnswers = answeredQuestions.filter(a => !a.isCorrect && !a.wasChanged);
    
    // Save current session data with all questions that were generated
    const sessionData: SessionData = {
      sessionNumber: testState.config.totalSessions - testState.currentSession + 1,
      questions: currentQuestions,
      answers: currentAnswers,
      startTime: Date.now() - (testState.config.sessionDuration * 1000),
      endTime: Date.now(),
      totalAnswered: answeredQuestions.length,
      correctAnswers: correctAnswers.length,
      wrongAnswers: wrongAnswers.length,
      corrections: corrections.length
    };
    
    setTestState(prev => ({
      ...prev,
      sessions: [...prev.sessions, sessionData],
      currentSession: prev.currentSession - 1,
      isCompleted: prev.currentSession <= 1
    }));
    
    // Reset for next session
    if (testState.currentSession > 1) {
      // Generate fresh questions for next session
      setCurrentQuestions(generateQuestions(1000));
      setCurrentAnswers([]);
      setCurrentQuestionIndex(0);
      timer.reset(testState.config.sessionDuration);
    }
  }, [testState.currentSession, testState.config, currentQuestions, currentAnswers]);
  
  const timer = useTimer(
    testState.config.sessionDuration, 
    handleSessionComplete, 
    testState.isActive && !testState.isCompleted
  );
  
  const handleStart = (config: TestConfig) => {
    setTestState({
      isActive: true,
      currentSession: config.totalSessions,
      timeRemaining: config.sessionDuration,
      sessions: [],
      isCompleted: false,
      config
    });
    setPreviousSession(config.totalSessions);
    setCurrentQuestionIndex(0);
    // Generate fresh questions for the test
    setCurrentQuestions(generateQuestions(1000));
    setCurrentAnswers([]);
    timer.reset(config.sessionDuration);
    
    // Focus on first input after a short delay (desktop only)
    if (!isMobile) {
      setTimeout(() => {
        const firstInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
  };
  
  const handleAnswer = (questionId: string, answer: string) => {
    const question = currentQuestions.find(q => q.id === questionId);
    if (!question) return;
    
    const isCorrect = answer !== '' && parseInt(answer) === question.correctAnswer;
    
    setCurrentAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === questionId);
      const existingAnswer = existingIndex >= 0 ? prev[existingIndex] : null;
      
      // Correction logic: correction occurs if previous answer was wrong and new answer is correct
      let wasChanged = false;
      
      if (existingAnswer) {
        if (!existingAnswer.isCorrect && isCorrect) {
          wasChanged = true;
        }
      }
      
      const newAnswer: Answer = {
        questionId,
        answer,
        isCorrect,
        wasChanged,
        timestamp: Date.now()
      };
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newAnswer;
        return updated;
      } else {
        return [...prev, newAnswer];
      }
    });
  };
  
  const handleEnterPressed = (currentIndex: number) => {
    const questionsPerColumn = 25;
    const totalColumns = isMobile ? 3 : 12;
    const currentColumn = Math.floor(currentIndex / questionsPerColumn);
    const currentRow = currentIndex % questionsPerColumn;
    
    let nextIndex;
    
    // If not at bottom of column, go down
    if (currentRow < questionsPerColumn - 1) {
      nextIndex = currentIndex + 1;
    } else {
      // If at bottom of column, go to top of next column
      if (currentColumn < totalColumns - 1) {
        nextIndex = (currentColumn + 1) * questionsPerColumn;
      } else {
        // If at last column of current set, go to first column of next set
        nextIndex = (currentColumn + 1) * questionsPerColumn;
      }
    }
    
    // Focus next input
    setTimeout(() => {
      const nextInput = document.querySelector(`input[data-index="${nextIndex}"]`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
        
        // For mobile, scroll into view
        if (window.innerWidth < 768) {
          nextInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 50);
  };
  
  // Mobile keyboard handlers - Left to right navigation
  const handleMobileNumberPress = (number: string) => {
    const maxQuestions = Math.min(currentQuestions.length, getCurrentViewMaxQuestions());
    
    if (currentQuestionIndex < maxQuestions) {
      const question = currentQuestions[currentQuestionIndex];
      handleAnswer(question.id, number);
      
      // Left to right navigation for 3 columns
      const currentColumn = Math.floor(currentQuestionIndex / 25);
      const currentRow = currentQuestionIndex % 25;
      
      let nextQuestionIndex;
      
      if (currentColumn < 2) {
        // Move to next column, same row
        nextQuestionIndex = currentQuestionIndex + 25;
      } else {
        // At rightmost column, move to leftmost column next row
        if (currentRow < 24) {
          nextQuestionIndex = (currentRow + 1); // Next row, first column
        } else {
          // At bottom right of current 3-column set, move to next 3-column set
          nextQuestionIndex = 75; // Next set starts at index 75
        }
      }
      
      // Auto-advance to next question
      if (nextQuestionIndex < maxQuestions) {
        setTimeout(() => {
          setCurrentQuestionIndex(nextQuestionIndex);
        }, 100);
      }
    }
  };
  
  const handleMobileDelete = () => {
    const maxQuestions = Math.min(currentQuestions.length, getCurrentViewMaxQuestions());
    
    if (currentQuestionIndex < maxQuestions) {
      const question = currentQuestions[currentQuestionIndex];
      handleAnswer(question.id, '');
    }
  };
  
  const handleQuestionChange = (index: number) => {
    setCurrentQuestionIndex(index);
  };
  
  const getCurrentViewMaxQuestions = () => {
    return isMobile ? 
      Math.ceil((currentQuestionIndex + 1) / 75) * 75 : // Mobile: current 3-column set
      Math.ceil((currentQuestionIndex + 1) / 300) * 300; // Desktop: current 12-column set
  };
  
  const getVisibleQuestions = () => {
    if (isMobile) {
      // Mobile: show current 3-column set (75 questions)
      const currentSet = Math.floor(currentQuestionIndex / 75);
      const startIndex = currentSet * 75;
      const endIndex = Math.min(startIndex + 75, currentQuestions.length);
      return {
        questions: currentQuestions.slice(startIndex, endIndex),
        startIndex,
        adjustedCurrentIndex: currentQuestionIndex - startIndex
      };
    } else {
      // Desktop: show current 12-column set (300 questions)
      const currentSet = Math.floor(currentQuestionIndex / 300);
      const startIndex = currentSet * 300;
      const endIndex = Math.min(startIndex + 300, currentQuestions.length);
      return {
        questions: currentQuestions.slice(startIndex, endIndex),
        startIndex,
        adjustedCurrentIndex: currentQuestionIndex - startIndex
      };
    }
  };
  
  const handleRestart = () => {
    setTestState({
      isActive: false,
      currentSession: 0,
      timeRemaining: 0,
      sessions: [],
      isCompleted: false,
      config: {
        sessionDuration: 30,
        totalSessions: 4
      }
    });
    setCurrentQuestions(generateQuestions(1000));
    setCurrentAnswers([]);
    setCurrentQuestionIndex(0);
    setPreviousSession(0);
    timer.reset(30);
  };
  
  if (!testState.isActive && !testState.isCompleted) {
    return <StartScreen onStart={handleStart} />;
  }
  
  if (testState.isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <button
              onClick={handleRestart}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Ulangi Tes
            </button>
          </div>
          <SessionResults sessions={testState.sessions} />
        </div>
      </div>
    );
  }
  
  // Calculate current stats with proper logic
  const answeredQuestions = currentAnswers.filter(a => a.answer !== '');
  const correctAnswers = currentAnswers.filter(a => a.isCorrect && a.answer !== '');
  const corrections = currentAnswers.filter(a => a.wasChanged);
  const wrongAnswers = answeredQuestions.filter(a => !a.isCorrect && !a.wasChanged);
  
  const visibleData = getVisibleQuestions();
  
  return (
    <div className={`min-h-screen bg-gray-100 p-2 md:p-4 ${isMobile ? 'pb-64' : ''}`}>
      <div className="max-w-7xl mx-auto">
        <Timer 
          timeRemaining={timer.timeRemaining} 
          currentSession={testState.currentSession}
          totalSessions={testState.config.totalSessions}
          sessionDuration={testState.config.sessionDuration}
        />
        
        <div className="bg-white rounded-lg shadow-lg p-3 md:p-6 mb-4">
          <div className="text-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Sesi {testState.config.totalSessions - testState.currentSession + 1}
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              {isMobile ? 'Ketuk soal untuk memilih, gunakan keyboard di bawah' : 'Kerjakan dari atas ke bawah, kolom demi kolom'}
            </p>
            <p className="text-xs text-gray-500">
              {Math.floor(testState.config.sessionDuration / 60) > 0 && `${Math.floor(testState.config.sessionDuration / 60)}m `}
              {testState.config.sessionDuration % 60}s per sesi • {testState.config.totalSessions} sesi total
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Soal unlimited - kerjakan sebanyak mungkin dalam waktu yang tersedia
            </p>
          </div>
          
          {/* Mobile Layout */}
          {isMobile ? (
            <MobileQuestionGrid
              questions={visibleData.questions}
              answers={currentAnswers}
              onAnswer={handleAnswer}
              currentQuestionIndex={visibleData.adjustedCurrentIndex}
              onQuestionChange={(index) => handleQuestionChange(index + visibleData.startIndex)}
              disabled={!testState.isActive || testState.isCompleted}
            />
          ) : (
            /* Desktop Layout - Traditional Pauli Test Grid */
            <div className="overflow-x-auto">
              <div className="flex gap-1 md:gap-2 justify-center" style={{ minWidth: 'fit-content' }}>
                {Array.from({ length: 12 }, (_, colIndex) => (
                  <div key={colIndex} className="flex flex-col gap-1">
                    {/* Column header with numbers */}
                    <div className="text-center text-xs text-gray-500 mb-1 h-4">
                      {colIndex + 1}
                    </div>
                    
                    {Array.from({ length: 25 }, (_, rowIndex) => {
                      const questionIndex = colIndex * 25 + rowIndex;
                      const globalQuestionIndex = questionIndex + visibleData.startIndex;
                      
                      if (questionIndex >= visibleData.questions.length) return null;
                      
                      const question = visibleData.questions[questionIndex];
                      const existingAnswer = currentAnswers.find(a => a.questionId === question.id);
                      
                      return (
                        <div key={question.id} className="relative">
                          {/* Row number on the left for first column */}
                          {colIndex === 0 && (
                            <div className="absolute -left-6 top-0 h-full flex items-center">
                              <span className="text-xs text-gray-400 font-mono">
                                {rowIndex + 1}
                              </span>
                            </div>
                          )}
                          
                          <div className="bg-white border border-gray-300 flex">
                            {/* Question numbers stacked vertically */}
                            <div className="w-8 md:w-10 h-12 md:h-16 flex flex-col border-r border-gray-300">
                              <div className="text-center text-xs md:text-sm font-mono py-0.5 md:py-1 border-b border-gray-200 flex-1 flex items-center justify-center">
                                {question.num1}
                              </div>
                              <div className="text-center text-xs md:text-sm font-mono py-0.5 md:py-1 flex-1 flex items-center justify-center">
                                {question.num2}
                              </div>
                            </div>
                            
                            {/* Answer input on the right */}
                            <div className="w-8 md:w-10 h-12 md:h-16 relative">
                              <input
                                type="text"
                                value={existingAnswer?.answer || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value.length > 1) return;
                                  if (value !== '' && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 9)) return;
                                  
                                  handleAnswer(question.id, value);
                                  
                                  // Auto-focus to next input after entering a value
                                  if (value !== '') {
                                    handleEnterPressed(globalQuestionIndex);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === 'ArrowDown') {
                                    e.preventDefault();
                                    handleEnterPressed(globalQuestionIndex);
                                  }
                                }}
                                disabled={!testState.isActive || testState.isCompleted}
                                maxLength={1}
                                data-index={globalQuestionIndex}
                                className="w-full h-full text-center font-mono text-xs md:text-sm border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-blue-50"
                                placeholder=""
                              />
                              
                              {existingAnswer?.wasChanged && (
                                <div className="absolute -right-0.5 -top-0.5 w-1 h-1 md:w-1.5 md:h-1.5 bg-orange-500 rounded-full" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Session Stats */}
        <div className="bg-white rounded-lg shadow-lg p-3 md:p-4">
          <div className="grid grid-cols-4 gap-2 md:gap-4 text-center">
            <div>
              <div className="text-lg md:text-2xl font-bold text-blue-600">
                {answeredQuestions.length}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Terjawab</div>
            </div>
            <div>
              <div className="text-lg md:text-2xl font-bold text-green-600">
                {correctAnswers.length}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Benar</div>
            </div>
            <div>
              <div className="text-lg md:text-2xl font-bold text-red-600">
                {wrongAnswers.length}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Salah</div>
            </div>
            <div>
              <div className="text-lg md:text-2xl font-bold text-orange-600">
                {corrections.length}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Pembetulan</div>
            </div>
          </div>
        </div>
        
        {/* Mobile Custom Keyboard */}
        {isMobile && testState.isActive && !testState.isCompleted && (
          <MobileKeyboard
            onNumberPress={handleMobileNumberPress}
            onDelete={handleMobileDelete}
          />
        )}
      </div>
    </div>
  );
}

export default App;
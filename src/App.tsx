import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StartScreen } from './components/StartScreen';
import { Timer } from './components/Timer';
import { QuestionCard } from './components/QuestionCard';
import { SessionResults } from './components/SessionResults';
import { MobileKeyboard } from './components/MobileKeyboard';
import { MobileQuestionGrid } from './components/MobileQuestionGrid';
import { useTimer } from './hooks/useTimer';
import { getAllQuestions, getTotalQuestionsCount } from './utils/questionGenerator';
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
  
  // Use pre-generated 4000 questions
  const [allQuestions] = useState(() => getAllQuestions());
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
    console.log('Session completing...');
    
    // Calculate stats properly
    const answeredQuestions = currentAnswers.filter(a => a.answer !== '');
    const correctAnswers = currentAnswers.filter(a => a.isCorrect && a.answer !== '');
    const corrections = currentAnswers.filter(a => a.wasChanged);
    const wrongAnswers = answeredQuestions.filter(a => !a.isCorrect && !a.wasChanged);
    
    // Save current session data with only the questions that were actually shown/attempted
    const maxQuestionIndex = Math.max(...currentAnswers.map(a => {
      const qIndex = allQuestions.findIndex(q => q.id === a.questionId);
      return qIndex;
    }), currentQuestionIndex);
    
    const sessionQuestions = allQuestions.slice(0, maxQuestionIndex + 1);
    
    const sessionData: SessionData = {
      sessionNumber: testState.config.totalSessions - testState.currentSession + 1,
      questions: sessionQuestions,
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
      setCurrentAnswers([]);
      setCurrentQuestionIndex(0);
    }
  }, [testState.currentSession, testState.config, allQuestions, currentAnswers, currentQuestionIndex]);
  
  const timer = useTimer(
    testState.config.sessionDuration, 
    handleSessionComplete, 
    testState.isActive && !testState.isCompleted
  );
  
  const handleStart = (config: TestConfig) => {
    console.log('Starting test with config:', config);
    console.log(`Total questions available: ${getTotalQuestionsCount()}`);
    
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
    const question = allQuestions.find(q => q.id === questionId);
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
        // If at last visible column, continue to next set of columns
        nextIndex = currentIndex + 1;
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
  
  // Mobile keyboard handlers - Horizontal navigation (left to right)
  const handleMobileNumberPress = (number: string) => {
    if (currentQuestionIndex < allQuestions.length) {
      const question = allQuestions[currentQuestionIndex];
      handleAnswer(question.id, number);
      
      // Mobile navigation: left to right, then next row
      const questionsPerColumn = 25;
      const currentColumn = Math.floor(currentQuestionIndex / questionsPerColumn);
      const currentRow = currentQuestionIndex % questionsPerColumn;
      
      let nextQuestionIndex;
      
      // Move to next column (right), same row
      if (currentColumn < 2) { // We have 3 columns (0, 1, 2)
        nextQuestionIndex = currentQuestionIndex + questionsPerColumn;
      } else {
        // At rightmost column, move to leftmost column next row
        if (currentRow < 24) { // Not at bottom row
          nextQuestionIndex = (currentRow + 1); // Next row, first column (column 0)
        } else {
          // At bottom right, move to next set of 3 columns
          const currentColumnSet = Math.floor(currentColumn / 3);
          nextQuestionIndex = (currentColumnSet + 1) * 3 * 25; // Next set, first column, first row
        }
      }
      
      // Auto-advance to next question
      if (nextQuestionIndex < allQuestions.length) {
        setTimeout(() => {
          setCurrentQuestionIndex(nextQuestionIndex);
        }, 100);
      }
    }
  };
  
  const handleMobileDelete = () => {
    if (currentQuestionIndex < allQuestions.length) {
      const question = allQuestions[currentQuestionIndex];
      handleAnswer(question.id, '');
    }
  };
  
  const handleQuestionChange = (index: number) => {
    setCurrentQuestionIndex(index);
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
              {isMobile ? 'Ketuk soal untuk memilih, isi dari kiri ke kanan' : 'Kerjakan dari atas ke bawah, kolom demi kolom'}
            </p>
            <p className="text-xs text-gray-500">
              {Math.floor(testState.config.sessionDuration / 60) > 0 && `${Math.floor(testState.config.sessionDuration / 60)}m `}
              {testState.config.sessionDuration % 60}s per sesi • {testState.config.totalSessions} sesi total
            </p>
            <p className="text-xs text-blue-600 mt-1">
              4000 soal tersedia - kerjakan sebanyak mungkin dalam waktu yang tersedia
            </p>
          </div>
          
          {/* Mobile Layout */}
          {isMobile ? (
            <MobileQuestionGrid
              questions={allQuestions}
              answers={currentAnswers}
              onAnswer={handleAnswer}
              currentQuestionIndex={currentQuestionIndex}
              onQuestionChange={handleQuestionChange}
              disabled={!testState.isActive || testState.isCompleted}
            />
          ) : (
            /* Desktop Layout - Traditional Pauli Test Grid */
            <div className="overflow-x-auto">
              <div className="flex gap-1 md:gap-2 justify-center" style={{ minWidth: 'fit-content' }}>
                {/* Show columns based on current progress, minimum 12 columns */}
                {(() => {
                  const maxQuestionIndex = Math.max(
                    currentQuestionIndex,
                    ...currentAnswers.map(a => {
                      const qIndex = allQuestions.findIndex(q => q.id === a.questionId);
                      return qIndex >= 0 ? qIndex : 0;
                    })
                  );
                  
                  // Show at least 12 columns, but expand as needed
                  const minColumns = 12;
                  const neededColumns = Math.ceil((maxQuestionIndex + 1) / 25);
                  const totalColumns = Math.max(minColumns, neededColumns + 2); // +2 for buffer
                  const maxColumns = Math.ceil(allQuestions.length / 25); // Don't exceed total available
                  const displayColumns = Math.min(totalColumns, maxColumns);
                  
                  return Array.from({ length: displayColumns }, (_, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-1">
                      {/* Column header with numbers */}
                      <div className="text-center text-xs text-gray-500 mb-1 h-4">
                        {colIndex + 1}
                      </div>
                      
                      {Array.from({ length: 25 }, (_, rowIndex) => {
                        const questionIndex = colIndex * 25 + rowIndex;
                        if (questionIndex >= allQuestions.length) return null;
                        
                        const question = allQuestions[questionIndex];
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
                                      handleEnterPressed(questionIndex);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === 'ArrowDown') {
                                      e.preventDefault();
                                      handleEnterPressed(questionIndex);
                                    }
                                  }}
                                  disabled={!testState.isActive || testState.isCompleted}
                                  maxLength={1}
                                  data-index={questionIndex}
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
                  ));
                })()}
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
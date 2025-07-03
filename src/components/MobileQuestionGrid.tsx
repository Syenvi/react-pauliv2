import React, { useState, useEffect } from 'react';
import { Question, Answer } from '../types/test';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MobileQuestionGridProps {
  questions: Question[];
  answers: Answer[];
  onAnswer: (questionId: string, answer: string) => void;
  currentQuestionIndex: number;
  onQuestionChange: (index: number) => void;
  disabled?: boolean;
}

export function MobileQuestionGrid({ 
  questions, 
  answers, 
  onAnswer, 
  currentQuestionIndex,
  onQuestionChange,
  disabled 
}: MobileQuestionGridProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 20; // 2 columns × 10 rows
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  
  // Auto-scroll to current question's page
  useEffect(() => {
    const targetPage = Math.floor(currentQuestionIndex / questionsPerPage);
    if (targetPage !== currentPage) {
      setCurrentPage(targetPage);
    }
  }, [currentQuestionIndex, questionsPerPage]);
  
  const startIndex = currentPage * questionsPerPage;
  const endIndex = Math.min(startIndex + questionsPerPage, questions.length);
  const currentPageQuestions = questions.slice(startIndex, endIndex);
  
  const handleQuestionClick = (questionIndex: number) => {
    if (!disabled) {
      onQuestionChange(startIndex + questionIndex);
    }
  };
  
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
      {/* Page Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevPage}
          disabled={currentPage === 0}
          className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Prev</span>
        </button>
        
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-700">
            Halaman {currentPage + 1} dari {totalPages}
          </div>
          <div className="text-xs text-gray-500">
            Soal {startIndex + 1}-{endIndex}
          </div>
        </div>
        
        <button
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
          className="flex items-center gap-1 px-3 py-2 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-sm">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      
      {/* Questions Grid - 2 columns */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-2">
          {currentPageQuestions.slice(0, Math.ceil(currentPageQuestions.length / 2)).map((question, index) => {
            const globalIndex = startIndex + index;
            const existingAnswer = answers.find(a => a.questionId === question.id);
            const isActive = globalIndex === currentQuestionIndex;
            
            return (
              <div
                key={question.id}
                onClick={() => handleQuestionClick(index)}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                  isActive 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-300 bg-white hover:border-gray-400'
                } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {/* Question Number */}
                <div className="text-xs text-gray-500 mb-1">#{globalIndex + 1}</div>
                
                {/* Question Content */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col text-center">
                    <div className="text-lg font-mono font-bold text-gray-800">{question.num1}</div>
                    <div className="text-lg font-mono font-bold text-gray-800">+{question.num2}</div>
                    <div className="border-t border-gray-400 mt-1 pt-1">
                      <div className={`text-xl font-mono font-bold min-h-[28px] flex items-center justify-center ${
                        existingAnswer?.answer ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {existingAnswer?.answer || '?'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Indicators */}
                  <div className="flex flex-col items-center gap-1">
                    {existingAnswer?.answer && (
                      <div className={`w-3 h-3 rounded-full ${
                        existingAnswer.isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    )}
                    {existingAnswer?.wasChanged && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Right Column */}
        <div className="space-y-2">
          {currentPageQuestions.slice(Math.ceil(currentPageQuestions.length / 2)).map((question, index) => {
            const globalIndex = startIndex + Math.ceil(currentPageQuestions.length / 2) + index;
            const existingAnswer = answers.find(a => a.questionId === question.id);
            const isActive = globalIndex === currentQuestionIndex;
            
            return (
              <div
                key={question.id}
                onClick={() => handleQuestionClick(Math.ceil(currentPageQuestions.length / 2) + index)}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                  isActive 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-300 bg-white hover:border-gray-400'
                } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {/* Question Number */}
                <div className="text-xs text-gray-500 mb-1">#{globalIndex + 1}</div>
                
                {/* Question Content */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col text-center">
                    <div className="text-lg font-mono font-bold text-gray-800">{question.num1}</div>
                    <div className="text-lg font-mono font-bold text-gray-800">+{question.num2}</div>
                    <div className="border-t border-gray-400 mt-1 pt-1">
                      <div className={`text-xl font-mono font-bold min-h-[28px] flex items-center justify-center ${
                        existingAnswer?.answer ? 'text-blue-600' : 'text-gray-400'
                      }`}>
                        {existingAnswer?.answer || '?'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Indicators */}
                  <div className="flex flex-col items-center gap-1">
                    {existingAnswer?.answer && (
                      <div className={`w-3 h-3 rounded-full ${
                        existingAnswer.isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    )}
                    {existingAnswer?.wasChanged && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Progress Indicator */}
      <div className="mt-4 bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
        />
      </div>
      <div className="text-center text-xs text-gray-500 mt-1">
        Soal {currentQuestionIndex + 1} dari {questions.length}
      </div>
    </div>
  );
}
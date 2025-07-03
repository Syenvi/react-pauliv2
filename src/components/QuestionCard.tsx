import React, { useState, useEffect, useRef } from 'react';
import { Question, Answer } from '../types/test';

interface QuestionCardProps {
  question: Question;
  onAnswer: (questionId: string, answer: string, wasChanged: boolean) => void;
  existingAnswer?: Answer;
  disabled?: boolean;
  index: number;
  onEnterPressed: (currentIndex: number) => void;
}

export function QuestionCard({ question, onAnswer, existingAnswer, disabled, index, onEnterPressed }: QuestionCardProps) {
  const [inputValue, setInputValue] = useState(existingAnswer?.answer || '');
  const [hasChanged, setHasChanged] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setInputValue(existingAnswer?.answer || '');
    setHasChanged(false);
  }, [existingAnswer]);
  
  const handleInputChange = (value: string) => {
    if (disabled) return;
    
    // Only allow single digits
    if (value.length > 1) return;
    if (value !== '' && (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 9)) return;
    
    const wasChanged = existingAnswer?.answer !== '' && existingAnswer?.answer !== value;
    setHasChanged(wasChanged);
    setInputValue(value);
    onAnswer(question.id, value, wasChanged);
    
    // Auto-focus to next input after entering a value
    if (value !== '') {
      setTimeout(() => {
        onEnterPressed(index);
      }, 50);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      onEnterPressed(index);
    }
  };
  
  // Focus method for external use
  const focus = () => {
    inputRef.current?.focus();
  };
  
  // Expose focus method
  React.useImperativeHandle(inputRef, () => ({
    focus
  }));
  
  return (
    <div className="relative bg-white border border-gray-300 w-12 h-16 flex flex-col">
      {/* First number */}
      <div className="text-center text-sm font-mono py-1 border-b border-gray-200">
        {question.num1}
      </div>
      
      {/* Second number with plus sign */}
      <div className="text-center text-sm font-mono py-1 border-b border-gray-200">
        +{question.num2}
      </div>
      
      {/* Answer input */}
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          maxLength={1}
          className="w-full h-full text-center font-mono text-sm border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-blue-50"
          placeholder=""
        />
        
        {hasChanged && (
          <div className="absolute -right-1 -top-1 w-1.5 h-1.5 bg-orange-500 rounded-full" />
        )}
      </div>
    </div>
  );
}
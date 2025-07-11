import React from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  timeRemaining: number;
  currentSession: number;
  totalSessions: number;
  sessionDuration: number;
}

export function Timer({ timeRemaining, currentSession, totalSessions, sessionDuration }: TimerProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  // Calculate progress based on current session
  const sessionProgress = ((totalSessions - currentSession) / totalSessions) * 100;
  
  // Calculate time progress for current session
  const timeProgress = ((sessionDuration - timeRemaining) / sessionDuration) * 100;
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="text-lg font-semibold text-gray-800">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          Sesi {totalSessions - currentSession + 1} dari {totalSessions}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Progress Keseluruhan</span>
          <span>{Math.round(sessionProgress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${sessionProgress}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>Sesi Saat Ini</span>
          <span>{Math.round(timeProgress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${timeProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { SessionData } from '../types/test';
import { CheckCircle, XCircle, RotateCcw, Target, TrendingUp, FileText, BarChart3, BookOpen } from 'lucide-react';

interface SessionResultsProps {
  sessions: SessionData[];
}

export function SessionResults({ sessions }: SessionResultsProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'details'>('summary');
  
  const totalStats = sessions.reduce((acc, session) => ({
    totalAnswered: acc.totalAnswered + session.totalAnswered,
    correctAnswers: acc.correctAnswers + session.correctAnswers,
    wrongAnswers: acc.wrongAnswers + session.wrongAnswers,
    corrections: acc.corrections + session.corrections
  }), { totalAnswered: 0, correctAnswers: 0, wrongAnswers: 0, corrections: 0 });
  
  const accuracy = totalStats.totalAnswered > 0 ? (totalStats.correctAnswers / totalStats.totalAnswered) * 100 : 0;
  
  // Calculate total questions available
  const totalQuestionsAvailable = sessions.length > 0 ? sessions[0].questions.length * sessions.length : 0;
  
  // Chart data
  const maxAnswered = Math.max(...sessions.map(s => s.totalAnswered), 1);
  const chartHeight = 200;
  
  const renderSummaryTab = () => (
    <>
      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">{totalStats.totalAnswered}</div>
          <div className="text-sm text-gray-600">Total Terjawab</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">{totalStats.correctAnswers}</div>
          <div className="text-sm text-gray-600">Benar</div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-600">{totalStats.wrongAnswers}</div>
          <div className="text-sm text-gray-600">Salah</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <RotateCcw className="w-8 h-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-600">{totalStats.corrections}</div>
          <div className="text-sm text-gray-600">Pembetulan</div>
        </div>
      </div>
      
      {/* Accuracy Score */}
      <div className="text-center mb-8">
        <div className="text-4xl font-bold text-indigo-600 mb-2">{accuracy.toFixed(1)}%</div>
        <div className="text-gray-600">Tingkat Akurasi</div>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-3">
          <div 
            className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${accuracy}%` }}
          />
        </div>
      </div>
      
      {/* Performance Chart */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Grafik Performa Per Sesi</h3>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="relative" style={{ height: chartHeight + 40 }}>
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="text-right">
                  {Math.round((maxAnswered * (5 - i)) / 5)}
                </div>
              ))}
            </div>
            
            {/* Chart area */}
            <div className="ml-8 relative" style={{ height: chartHeight }}>
              {/* Grid lines */}
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="absolute w-full border-t border-gray-200"
                  style={{ top: `${(i * chartHeight) / 5}px` }}
                />
              ))}
              
              {/* Chart bars only */}
              <div className="relative h-full flex items-end justify-between">
                {sessions.map((session) => {
                  const barHeight = (session.totalAnswered / maxAnswered) * chartHeight;
                  
                  return (
                    <div key={session.sessionNumber} className="flex flex-col items-center relative">
                      {/* Bar */}
                      <div className="relative mb-2">
                        <div
                          className="bg-blue-500 rounded-t-md transition-all duration-500 w-12 md:w-16"
                          style={{ height: `${barHeight}px` }}
                        />
                        {/* Value label on top of bar */}
                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-gray-700">
                          {session.totalAnswered}
                        </div>
                      </div>
                      
                      {/* X-axis label */}
                      <div className="text-xs text-gray-600 font-medium">
                        Sesi {session.sessionNumber}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* X-axis line */}
            <div className="ml-8 border-t border-gray-300 mt-2" />
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-600">
              <span className="inline-flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                Jumlah Soal Terjawab
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Session Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Rincian Per Sesi</h3>
        {sessions.map((session, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700">Sesi {session.sessionNumber}</span>
              <span className="text-sm text-gray-500">
                {session.totalAnswered > 0 ? `${((session.correctAnswers / session.totalAnswered) * 100).toFixed(1)}%` : '0%'} akurasi
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-700">{session.totalAnswered}</div>
                <div className="text-gray-500">Terjawab</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">{session.correctAnswers}</div>
                <div className="text-gray-500">Benar</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-red-600">{session.wrongAnswers}</div>
                <div className="text-gray-500">Salah</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-600">{session.corrections}</div>
                <div className="text-gray-500">Pembetulan</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
  
  const renderDetailsTab = () => (
    <div className="space-y-6">
      {sessions.map((session) => (
        <div key={session.sessionNumber} className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Sesi {session.sessionNumber} - Detail Jawaban
          </h3>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Benar</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Salah</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
              <span>Pembetulan</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span>Tidak dijawab</span>
            </div>
          </div>
          
          {/* Questions Grid - Same layout as test */}
          <div className="overflow-x-auto">
            <div className="flex gap-1 md:gap-2 justify-center" style={{ minWidth: 'fit-content' }}>
              {Array.from({ length: 12 }, (_, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-1">
                  {/* Column header */}
                  <div className="text-center text-xs text-gray-500 mb-1 h-4">
                    {colIndex + 1}
                  </div>
                  
                  {Array.from({ length: 25 }, (_, rowIndex) => {
                    const questionIndex = colIndex * 25 + rowIndex;
                    if (questionIndex >= session.questions.length) return null;
                    
                    const question = session.questions[questionIndex];
                    const answer = session.answers.find(a => a.questionId === question.id);
                    
                    // Determine background color
                    let bgColor = 'bg-gray-300'; // Not answered
                    if (answer && answer.answer !== '') {
                      if (answer.isCorrect) {
                        bgColor = 'bg-green-500';
                      } else {
                        bgColor = 'bg-red-500';
                      }
                    }
                    
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
                        
                        <div className={`border border-gray-300 flex ${bgColor}`}>
                          {/* Question numbers stacked vertically */}
                          <div className="w-8 md:w-10 h-12 md:h-16 flex flex-col border-r border-gray-300 bg-white">
                            <div className="text-center text-xs md:text-sm font-mono py-0.5 md:py-1 border-b border-gray-200 flex-1 flex items-center justify-center">
                              {question.num1}
                            </div>
                            <div className="text-center text-xs md:text-sm font-mono py-0.5 md:py-1 flex-1 flex items-center justify-center">
                              {question.num2}
                            </div>
                          </div>
                          
                          {/* Answer display */}
                          <div className="w-8 md:w-10 h-12 md:h-16 relative flex items-center justify-center">
                            <span className="text-xs md:text-sm font-mono text-white font-bold">
                              {answer?.answer || ''}
                            </span>
                            
                            {/* Correction indicator */}
                            {answer?.wasChanged && (
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
          
          {/* Session stats */}
          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
            <div>
              <div className="font-semibold text-gray-700">{session.totalAnswered}</div>
              <div className="text-gray-500">Terjawab</div>
            </div>
            <div>
              <div className="font-semibold text-green-600">{session.correctAnswers}</div>
              <div className="text-gray-500">Benar</div>
            </div>
            <div>
              <div className="font-semibold text-red-600">{session.wrongAnswers}</div>
              <div className="text-gray-500">Salah</div>
            </div>
            <div>
              <div className="font-semibold text-orange-600">{session.corrections}</div>
              <div className="text-gray-500">Pembetulan</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Hasil Tes Pauli</h2>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'summary'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Ringkasan
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'details'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Detail Jawaban
        </button>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'summary' ? renderSummaryTab() : renderDetailsTab()}
    </div>
  );
}
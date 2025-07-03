import React, { useState } from 'react';
import { Play, Clock, Target, Calculator, Settings } from 'lucide-react';
import { TestConfig } from '../types/test';

interface StartScreenProps {
  onStart: (config: TestConfig) => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [totalDurationMinutes, setTotalDurationMinutes] = useState(10); // total minutes
  const [totalSessions, setTotalSessions] = useState(5);
  
  const handleStart = () => {
    const sessionDurationSeconds = Math.round((totalDurationMinutes * 60) / totalSessions);
    
    const config: TestConfig = {
      sessionDuration: sessionDurationSeconds,
      totalSessions
    };
    onStart(config);
  };
  
  const sessionDurationSeconds = Math.round((totalDurationMinutes * 60) / totalSessions);
  const sessionMinutes = Math.floor(sessionDurationSeconds / 60);
  const sessionSeconds = sessionDurationSeconds % 60;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Calculator className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tes Pauli</h1>
          <p className="text-gray-600">Tes Psikologi Kecepatan dan Ketelitian</p>
        </div>
        
        {/* Configuration Section */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Pengaturan Tes</h3>
          </div>
          
          <div className="space-y-4">
            {/* Total Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durasi Total Tes (menit)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="120"
                  step="1"
                  value={totalDurationMinutes}
                  onChange={(e) => setTotalDurationMinutes(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-mono text-sm min-w-[70px] text-center">
                  {totalDurationMinutes}m
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1m</span>
                <span>120m</span>
              </div>
            </div>
            
            {/* Total Sessions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jumlah Sesi
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={totalSessions}
                  onChange={(e) => setTotalSessions(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-mono text-sm min-w-[70px] text-center">
                  {totalSessions}
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>20</span>
              </div>
            </div>
            
            {/* Calculated Session Duration Display */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-800 mb-1">
                  Durasi per Sesi: {sessionMinutes > 0 && `${sessionMinutes}m `}{sessionSeconds}s
                </div>
                <div className="text-sm text-indigo-600">
                  {totalDurationMinutes} menit ÷ {totalSessions} sesi
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Calculator className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-semibold text-gray-800">Penjumlahan Sederhana</div>
              <div className="text-sm text-gray-600">Hanya tulis digit terakhir hasil (0-9)</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Target className="w-5 h-5 text-purple-600" />
            <div>
              <div className="font-semibold text-gray-800">Kerjakan Berurutan</div>
              <div className="text-sm text-gray-600">Dari atas ke bawah, kolom demi kolom</div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-sm text-yellow-800">
              <strong>Contoh:</strong> 7 + 8 = 15, tulis <strong>5</strong><br/>
              <strong>Contoh:</strong> 3 + 4 = 7, tulis <strong>7</strong>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleStart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          Mulai Tes ({totalSessions} sesi × {sessionMinutes > 0 && `${sessionMinutes}m `}{sessionSeconds}s)
        </button>
      </div>
    </div>
  );
}
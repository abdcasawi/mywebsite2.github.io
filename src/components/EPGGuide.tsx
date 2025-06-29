import React from 'react';
import { Clock, Star } from 'lucide-react';
import { Program } from '../types';

interface EPGGuideProps {
  programs: Program[];
  selectedChannelId: string | null;
}

export default function EPGGuide({ programs, selectedChannelId }: EPGGuideProps) {
  const channelPrograms = programs.filter(p => p.channelId === selectedChannelId);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isNowPlaying = (program: Program) => {
    const now = new Date();
    return now >= program.startTime && now <= program.endTime;
  };

  if (!selectedChannelId || channelPrograms.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-white text-lg font-semibold mb-4">Program Guide</h3>
        <p className="text-gray-400">Select a channel to view the program schedule</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock size={20} />
        Program Guide
      </h3>
      
      <div className="space-y-3">
        {channelPrograms.map((program) => (
          <div
            key={program.id}
            className={`
              p-4 rounded-lg border transition-all duration-200
              ${isNowPlaying(program)
                ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-600/25'
                : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
              }
            `}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className={`font-semibold ${isNowPlaying(program) ? 'text-white' : 'text-gray-200'}`}>
                  {program.title}
                </h4>
                <p className={`text-sm ${isNowPlaying(program) ? 'text-blue-100' : 'text-gray-400'}`}>
                  {program.description}
                </p>
              </div>
              {isNowPlaying(program) && (
                <div className="flex items-center gap-1 bg-red-500 px-2 py-1 rounded text-xs font-semibold text-white">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <span className={isNowPlaying(program) ? 'text-blue-100' : 'text-gray-400'}>
                  {formatTime(program.startTime)} - {formatTime(program.endTime)}
                </span>
                <span className={`px-2 py-1 rounded ${
                  isNowPlaying(program) 
                    ? 'bg-blue-700 text-blue-100' 
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {program.genre}
                </span>
                {program.rating && (
                  <span className={`px-2 py-1 rounded ${
                    isNowPlaying(program) 
                      ? 'bg-blue-700 text-blue-100' 
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {program.rating}
                  </span>
                )}
              </div>
              
              <button className={`p-1 rounded hover:bg-opacity-80 transition-colors ${
                isNowPlaying(program) 
                  ? 'hover:bg-blue-700' 
                  : 'hover:bg-gray-600'
              }`}>
                <Star size={16} className={isNowPlaying(program) ? 'text-blue-100' : 'text-gray-400'} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
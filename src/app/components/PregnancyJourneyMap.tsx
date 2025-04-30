"use client";
import React, { useState, useEffect } from 'react';
import { WeeklyFormData } from '../types/forms';
import { WeeklyDataPanel } from './WeeklyDataPanel';

interface PregnancyJourneyMapProps {
  weeklyData: WeeklyFormData[];
  currentWeek: number;
  availableWeeks: number[];
  onWeekSelect: (weekNumber: number) => void;
}

export const PregnancyJourneyMap: React.FC<PregnancyJourneyMapProps> = ({ 
  weeklyData, 
  currentWeek,
  availableWeeks,
  onWeekSelect
}) => {
  const [selectedWeekData, setSelectedWeekData] = useState<WeeklyFormData | null>(null);
  const maxWeeks = 40;
  const weeks = Array.from({ length: maxWeeks }, (_, i) => i + 1);

  const trimesters = {
    first: weeks.slice(0, 13),
    second: weeks.slice(13, 26),
    third: weeks.slice(26)
  };

  const getWeekData = (week: number) => {
    return weeklyData.find(data => data.weekNumber === week);
  };

  const getWeekStatus = (week: number) => {
    if (week === currentWeek) return 'current';
    if (availableWeeks.includes(week)) return 'available';
    return 'future';
  };

  const handleWeekClick = (week: number) => {
    if (availableWeeks.includes(week)) {
      onWeekSelect(week);
      const data = getWeekData(week);
      if (data) {
        setSelectedWeekData(data);
      }
    }
  };

  const renderWeek = (week: number) => {
    const status = getWeekStatus(week);
    const data = getWeekData(week);

    return (
      <div 
        key={week}
        onClick={() => handleWeekClick(week)}
        className={`
          relative w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200
          ${status === 'current' ? 'bg-blue-500 text-white ring-4 ring-blue-200' :
            status === 'available' ? 'bg-green-500 text-white cursor-pointer hover:ring-2 hover:ring-green-300' :
            'bg-gray-200 text-gray-500'}
          ${availableWeeks.includes(week) ? 'cursor-pointer' : 'cursor-default'}
        `}
        title={`Week ${week}${data ? ': Click to view details' : ''}`}
      >
        {week}
        {status === 'available' && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
        )}
      </div>
    );
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
        <h3 className="text-lg font-semibold text-gray-800">Pregnancy Journey Map</h3>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-600">First Trimester (Weeks 1-13)</h4>
          <div className="grid grid-cols-13 gap-2">
            {trimesters.first.map(week => renderWeek(week))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-600">Second Trimester (Weeks 14-26)</h4>
          <div className="grid grid-cols-13 gap-2">
            {trimesters.second.map(week => renderWeek(week))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-600">Third Trimester (Weeks 27-40)</h4>
          <div className="grid grid-cols-13 gap-2">
            {trimesters.third.map(week => renderWeek(week))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 font-medium mb-2">Legend</div>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-gray-200 mr-2"></div>
              <span>Future</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span>Available Data</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-500 ring-2 ring-blue-200 mr-2"></div>
              <span>Current Week</span>
            </div>
          </div>
        </div>
      </div>

      {selectedWeekData && (
        <WeeklyDataPanel 
          data={selectedWeekData} 
          onClose={() => setSelectedWeekData(null)} 
        />
      )}
    </>
  );
};
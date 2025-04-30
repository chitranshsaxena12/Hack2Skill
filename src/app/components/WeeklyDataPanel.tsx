"use client";
import React from 'react';
import { WeeklyFormData } from '../types/forms';

interface WeeklyDataPanelProps {
  data: WeeklyFormData;
  onClose: () => void;
}

export const WeeklyDataPanel: React.FC<WeeklyDataPanelProps> = ({ data, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h3 className="text-xl font-semibold mb-4">Week {data.weekNumber} Data</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="font-medium">Basic Information</p>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-600">Gestational Age:</span> {data.gestationalAge} weeks</p>
              <p><span className="text-gray-600">Weight Change:</span> {data.weightChange} kg</p>
              <p><span className="text-gray-600">Blood Pressure:</span> {data.bloodPressure}</p>
              <p><span className="text-gray-600">Sleep Hours:</span> {data.sleepHours}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Mental Health</p>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-600">Stress Level:</span> {data.stressLevel}/5</p>
              <p><span className="text-gray-600">Support Score:</span> {data.supportScore}/5</p>
              <p><span className="text-gray-600">PHQ-2 Score:</span> {data.phq2Score}/6</p>
              <p><span className="text-gray-600">Anxiety Score:</span> {data.anxietyScore}/6</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Physical Symptoms</p>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-600">Bleeding Episodes:</span> {data.bleedingEpisodes ? 'Yes' : 'No'}</p>
              <p><span className="text-gray-600">Pain/Cramping:</span> {data.painCramping ? 'Yes' : 'No'}</p>
              <p><span className="text-gray-600">Dizziness Episodes:</span> {data.dizzinessEpisodes}</p>
              <p><span className="text-gray-600">Tiredness Score:</span> {data.tirednessScore}/5</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Nutrition & Health</p>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-600">Iron Tablets Taken:</span> {data.ironTablets}</p>
              <p><span className="text-gray-600">Dietary Iron Score:</span> {data.dietaryIron}/5</p>
              <p><span className="text-gray-600">MUAC:</span> {data.muac} cm</p>
              <p><span className="text-gray-600">Blood Sugar:</span> {data.bloodSugar} mg/dL</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Diet & Activity</p>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-600">Appetite Score:</span> {data.appetiteScore}/5</p>
              <p><span className="text-gray-600">Dietary Diversity:</span> {data.dietaryDiversity}</p>
              <p><span className="text-gray-600">Daily Meals:</span> {data.mealFrequency}</p>
              <p><span className="text-gray-600">Physical Activity:</span> {data.physicalActivity} min/day</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Additional Symptoms</p>
            <div className="text-sm space-y-1">
              <p><span className="text-gray-600">Swelling:</span> {data.swelling ? 'Yes' : 'No'}</p>
              <p><span className="text-gray-600">Paleness:</span> {data.paleness ? 'Yes' : 'No'}</p>
              <p><span className="text-gray-600">Hair Condition:</span> {data.hairCondition ? 'Poor' : 'Normal'}</p>
              <p><span className="text-gray-600">Skin Condition:</span> {data.skinCondition ? 'Poor' : 'Normal'}</p>
              <p><span className="text-gray-600">Slow Healing Wounds:</span> {data.slowHealingWounds ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p>Submitted on: {new Date(data.submissionDate).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};
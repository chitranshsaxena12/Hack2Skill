"use client";
import React from 'react';

interface RiskLevel {
  level: 'low' | 'medium' | 'high';
  score: number;
  recommendations: string[];
  maternalConditions: {
    [key: string]: {
      score: number;
      note: string;
    }
  };
}

interface RiskPredictionProps {
  riskLevel: RiskLevel;
  onClose: () => void;
}

export const RiskPrediction: React.FC<RiskPredictionProps> = ({ riskLevel, onClose }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 0.3) return 'bg-green-500';
    if (score <= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 m-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Risk Assessment Results</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${getRiskColor(riskLevel.level)}`}>
                {riskLevel.level.charAt(0).toUpperCase() + riskLevel.level.slice(1)} Risk
              </div>
              <div className="text-sm text-gray-600">
                Overall Risk Score: {riskLevel.score.toFixed(2)}
              </div>
            </div>

            {riskLevel.maternalConditions && Object.keys(riskLevel.maternalConditions).length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">Condition Risk Scores</h4>
                <div className="space-y-3">
                  {Object.entries(riskLevel.maternalConditions).map(([condition, details], index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">{condition.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}</span>
                        <span className="text-gray-600">{details.score.toFixed(1)}/10</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getScoreColor(details.score / 10)} transition-all duration-500`}
                          style={{ width: `${(details.score / 10) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{details.note}</p>
                    </div>
                  ))}
                </div>
                {/* <h3 className="text-xl font-semibold mb-3">Identified Conditions:</h3>
                <ul className="list-disc pl-6 space-y-2">
                  {Object.entries(riskLevel.maternalConditions).map(([condition, details]) => (
                    <li key={condition} className="text-gray-700">
                      {condition.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </li>
                  ))}
                </ul> */}
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Recommendations</h4>
              <ul className="list-disc list-inside space-y-2">
                {riskLevel.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-gray-600">{recommendation}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close and Continue
          </button>
        </div>
      </div>
    </div>
  );
};
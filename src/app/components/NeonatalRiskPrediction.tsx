"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

interface RiskLevel {
    level: 'low' | 'medium' | 'high';
    score: number;
    recommendations: string[];
    neonatalConditions: {
        [key: string]: {
            score: number;
            note: string;
        }
    };
}

interface NeonatalRiskPredictionProps {
    riskLevel: RiskLevel;
    onClose: () => void;
    setPage: () => void;
}

export const NeonatalRiskPrediction: React.FC<NeonatalRiskPredictionProps> = ({ riskLevel, onClose, setPage }) => {
    const router = useRouter();
    const conditions = riskLevel.neonatalConditions || {};

    const handleClose = () => {
        onClose();
        setPage();
    };

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
                    <h3 className="text-2xl font-bold">Neonatal Health Assessment</h3>
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
                                Overall Health Score: {((1 - riskLevel.score) * 100).toFixed(1)}%
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-800">Health Assessment Categories</h4>
                            <div className="space-y-3">
                                {Object.entries(conditions).map(([condition, details], index) => (
                                    <div key={index} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-700">
                                                {condition.split('_').map(word => 
                                                    word.charAt(0).toUpperCase() + word.slice(1)
                                                ).join(' ')}
                                            </span>
                                            <span className="text-gray-600">
                                                {((1 - details.score) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${getScoreColor(details.score)} transition-all duration-500`}
                                                style={{ width: `${details.score * 100}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{details.note}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-800">Action Items & Recommendations</h4>
                            <ul className="list-disc list-inside space-y-2">
                                {riskLevel.recommendations.map((recommendation, index) => (
                                    <li key={index} className="text-sm text-gray-600">{recommendation}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-200">
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            {riskLevel.level === 'high' && (
                                <button
                                    onClick={() => setPage()}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Contact Emergency Services
                                </button>
                            )}
                            <button
                                onClick={() => setPage()}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Schedule Pediatrician Visit
                            </button>
                        </div>
                        <button
                            onClick={handleClose}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Close and Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
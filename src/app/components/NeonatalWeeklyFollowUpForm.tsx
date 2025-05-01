"use client";
import React, { useState, useEffect } from 'react';
import { NeonatalWeeklyData } from '../types/forms';
import { NeonatalRiskPrediction } from './NeonatalRiskPrediction';

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

interface NeonatalWeeklyFollowUpFormProps {
    onBack: () => void;
}

interface UserInfo {
    userId: string;
    name: string;
}

export const NeonatalWeeklyFollowUpForm: React.FC<NeonatalWeeklyFollowUpFormProps> = ({ onBack }) => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [weekNumber, setWeekNumber] = useState<number>(1);
    const [showPrediction, setShowPrediction] = useState(false);
    const [riskPrediction, setRiskPrediction] = useState<RiskLevel | null>(null);

    const [weeklyData, setWeeklyData] = useState<NeonatalWeeklyData>({
        weekNumber: 1,
        weightGain: 0,
        heightGain: 0,
        headCircumferenceGain: 0,
        temperature: 37,
        respiratoryRate: 45,
        heartRate: 140,
        feedingPattern: 'good',
        feedingFrequency: 8,
        urinationFrequency: 6,
        stoolFrequency: 4,
        sleepPattern: 'good',
        sleepHours: 16,
        skinColor: 'normal',
        skinCondition: 'normal',
        umbilicalCordHealing: true,
        eyeCondition: 'normal',
        cryPattern: 'normal',
        jaundice: false,
        vomiting: false,
        diarrhea: false,
        fever: false,
        cough: false,
        breathing: 'normal',
        activity: 'normal',
        immunizationsUpToDate: true,
        vitaminSupplements: true,
        issues: [],
        notes: '',
        submissionDate: new Date().toISOString()
    });

    useEffect(() => {
        const savedUserInfo = localStorage.getItem("currentNeonatalUser");
        if (savedUserInfo) {
            setUserInfo(JSON.parse(savedUserInfo));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            setWeeklyData(prev => ({
                ...prev,
                [name]: (e.target as HTMLInputElement).checked
            }));
        } else if (name === 'issues') {
            const issues = value.split(',').map(issue => issue.trim()).filter(issue => issue);
            setWeeklyData(prev => ({
                ...prev,
                issues
            }));
        } else if (type === 'number') {
            setWeeklyData(prev => ({
                ...prev,
                [name]: parseFloat(value) || 0
            }));
        } else {
            setWeeklyData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submissionData = {
                ...weeklyData,
                userId: userInfo?.userId,
                submissionDate: new Date().toISOString()
            };

            // Save weekly data
            const response = await fetch('/api/save-weekly-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: submissionData,
                    fileName: `neonatal-week${weekNumber}.json`
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save weekly data');
            }

            // Get risk prediction
            const riskResponse = await fetch("/api/predict-risk", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(submissionData)
            });

            if (!riskResponse.ok) {
                throw new Error('Failed to get risk prediction');
            }

            const riskData = await riskResponse.json();
            setRiskPrediction(riskData);
            setShowPrediction(true);

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to submit weekly follow-up or get risk prediction');
        }
    };

    if (!userInfo) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-xl font-semibold text-red-600">Please complete registration first</h2>
                    <button
                        onClick={onBack}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Go to Registration
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fllup p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-600">Patient ID:</span>
                        <span className="text-blue-600">{userInfo.userId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">Name:</span>
                        <span className="text-gray-800">{userInfo.name}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Neonatal Weekly Follow-Up</h2>

                    {/* Growth Measurements */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="weightGain" className="block text-sm font-medium text-gray-700">
                                Weight Gain (g/day)
                            </label>
                            <input
                                type="number"
                                id="weightGain"
                                name="weightGain"
                                value={weeklyData.weightGain}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="heightGain" className="block text-sm font-medium text-gray-700">
                                Height Gain (cm/week)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                id="heightGain"
                                name="heightGain"
                                value={weeklyData.heightGain}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="headCircumferenceGain" className="block text-sm font-medium text-gray-700">
                                Head Circumference Gain (cm/week)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                id="headCircumferenceGain"
                                name="headCircumferenceGain"
                                value={weeklyData.headCircumferenceGain}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            />
                        </div>
                    </div>

                    {/* Vital Signs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
                                Temperature (°C)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                id="temperature"
                                name="temperature"
                                value={weeklyData.temperature}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="respiratoryRate" className="block text-sm font-medium text-gray-700">
                                Respiratory Rate (breaths/min)
                            </label>
                            <input
                                type="number"
                                id="respiratoryRate"
                                name="respiratoryRate"
                                value={weeklyData.respiratoryRate}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="heartRate" className="block text-sm font-medium text-gray-700">
                                Heart Rate (beats/min)
                            </label>
                            <input
                                type="number"
                                id="heartRate"
                                name="heartRate"
                                value={weeklyData.heartRate}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            />
                        </div>
                    </div>

                    {/* Feeding and Sleep */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="feedingPattern" className="block text-sm font-medium text-gray-700">
                                Feeding Pattern
                            </label>
                            <select
                                id="feedingPattern"
                                name="feedingPattern"
                                value={weeklyData.feedingPattern}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            >
                                <option value="excellent">Excellent</option>
                                <option value="good">Good</option>
                                <option value="fair">Fair</option>
                                <option value="poor">Poor</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="feedingFrequency" className="block text-sm font-medium text-gray-700">
                                Feeding Frequency (times/day)
                            </label>
                            <input
                                type="number"
                                id="feedingFrequency"
                                name="feedingFrequency"
                                value={weeklyData.feedingFrequency}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="sleepPattern" className="block text-sm font-medium text-gray-700">
                                Sleep Pattern
                            </label>
                            <select
                                id="sleepPattern"
                                name="sleepPattern"
                                value={weeklyData.sleepPattern}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            >
                                <option value="excellent">Excellent</option>
                                <option value="good">Good</option>
                                <option value="fair">Fair</option>
                                <option value="poor">Poor</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="sleepHours" className="block text-sm font-medium text-gray-700">
                                Sleep Hours (per day)
                            </label>
                            <input
                                type="number"
                                id="sleepHours"
                                name="sleepHours"
                                value={weeklyData.sleepHours}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            />
                        </div>
                    </div>

                    {/* Physical Conditions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="skinColor" className="block text-sm font-medium text-gray-700">
                                Skin Color
                            </label>
                            <select
                                id="skinColor"
                                name="skinColor"
                                value={weeklyData.skinColor}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            >
                                <option value="normal">Normal</option>
                                <option value="pale">Pale</option>
                                <option value="jaundiced">Jaundiced</option>
                                <option value="cyanotic">Cyanotic</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="skinCondition" className="block text-sm font-medium text-gray-700">
                                Skin Condition
                            </label>
                            <select
                                id="skinCondition"
                                name="skinCondition"
                                value={weeklyData.skinCondition}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            >
                                <option value="normal">Normal</option>
                                <option value="rash">Rash</option>
                                <option value="dry">Dry</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="cryPattern" className="block text-sm font-medium text-gray-700">
                                Cry Pattern
                            </label>
                            <select
                                id="cryPattern"
                                name="cryPattern"
                                value={weeklyData.cryPattern}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            >
                                <option value="normal">Normal</option>
                                <option value="high-pitched">High-pitched</option>
                                <option value="weak">Weak</option>
                                <option value="excessive">Excessive</option>
                            </select>
                        </div>
                    </div>

                    {/* Health Issues */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Health Issues</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="jaundice"
                                    name="jaundice"
                                    checked={weeklyData.jaundice}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                                <label htmlFor="jaundice" className="text-sm text-gray-700">
                                    Jaundice
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="vomiting"
                                    name="vomiting"
                                    checked={weeklyData.vomiting}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                                <label htmlFor="vomiting" className="text-sm text-gray-700">
                                    Vomiting
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="diarrhea"
                                    name="diarrhea"
                                    checked={weeklyData.diarrhea}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                                <label htmlFor="diarrhea" className="text-sm text-gray-700">
                                    Diarrhea
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="fever"
                                    name="fever"
                                    checked={weeklyData.fever}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                                <label htmlFor="fever" className="text-sm text-gray-700">
                                    Fever
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="breathing" className="block text-sm font-medium text-gray-700">
                                    Breathing
                                </label>
                                <select
                                    id="breathing"
                                    name="breathing"
                                    value={weeklyData.breathing}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                >
                                    <option value="normal">Normal</option>
                                    <option value="fast">Fast</option>
                                    <option value="difficult">Difficult</option>
                                    <option value="noisy">Noisy</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="activity" className="block text-sm font-medium text-gray-700">
                                    Activity Level
                                </label>
                                <select
                                    id="activity"
                                    name="activity"
                                    value={weeklyData.activity}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                >
                                    <option value="normal">Normal</option>
                                    <option value="lethargic">Lethargic</option>
                                    <option value="irritable">Irritable</option>
                                    <option value="excessive-crying">Excessive Crying</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="immunizationsUpToDate"
                                    name="immunizationsUpToDate"
                                    checked={weeklyData.immunizationsUpToDate}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                                <label htmlFor="immunizationsUpToDate" className="text-sm text-gray-700">
                                    Immunizations Up to Date
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="vitaminSupplements"
                                    name="vitaminSupplements"
                                    checked={weeklyData.vitaminSupplements}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                                <label htmlFor="vitaminSupplements" className="text-sm text-gray-700">
                                    Taking Vitamin Supplements
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="issues" className="block text-sm font-medium text-gray-700">
                                Other Issues (comma-separated)
                            </label>
                            <input
                                type="text"
                                id="issues"
                                name="issues"
                                value={weeklyData.issues.join(', ')}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                placeholder="e.g., rash, congestion, poor feeding"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                Additional Notes
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={weeklyData.notes}
                                onChange={handleChange}
                                rows={3}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                placeholder="Any additional observations or concerns..."
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <button
                            type="submit"
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Submit Weekly Follow-Up
                        </button>
                    </div>
                </form>
            </div>

            {showPrediction && riskPrediction && (
                <NeonatalRiskPrediction
                    riskLevel={riskPrediction}
                    onClose={() => setShowPrediction(false)}
                    setPage={onBack}
                />
            )}
        </div>
    );
};
"use client";
import React, { useState, useEffect } from 'react';
import { WeeklyFormData } from '../types/forms';
import { RiskPrediction } from './RiskPrediction';
import { PregnancyJourneyMap } from './PregnancyJourneyMap';

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

interface MaternalWeeklyFollowUpFormProps {
    onBack: () => void;
}

interface UserInfo {
    userId: string;
    name: string;
}

interface WeeklyFileData {
    weekNumber: number;
    data: WeeklyFormData;
}

export const MaternalWeeklyFollowUpForm: React.FC<MaternalWeeklyFollowUpFormProps> = ({ onBack }) => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);
    const [selectedWeekData, setSelectedWeekData] = useState<WeeklyFormData | null>(null);
    const [weeklyData, setWeeklyData] = useState<WeeklyFormData>(() => {
        const saved = localStorage.getItem("maternalWeekly");
        return saved ? JSON.parse(saved) : {
            gestationalAge: 0,
            weightChange: 0,
            bloodPressure: "",
            sleepHours: 0,
            stressLevel: 1,
            supportScore: 1,
            phq2Score: 0,
            anxietyScore: 0,
            bleedingEpisodes: false,
            painCramping: false,
            contractionCount: false,
            fluidLeak: false,
            utiSymptoms: false,
            tirednessScore: 1,
            dizzinessEpisodes: 0,
            paleness: false,
            ironTablets: 0,
            muac: 0,
            dietaryIron: 0,
            thirstFrequency: 0,
            urinationFrequency: 0,
            bloodSugar: 0,
            appetiteScore: 1,
            dietaryDiversity: 0,
            mealFrequency: 0,
            swelling: false,
            hairCondition: false,
            skinCondition: false,
            physicalActivity: 0,
            slowHealingWounds: false,
            submissionDate: new Date().toISOString(),
            weekNumber: 0
        };
    });

    const [showPrediction, setShowPrediction] = useState(false);
    const [riskPrediction, setRiskPrediction] = useState<RiskLevel | null>(null);
    const [allWeeklyData, setAllWeeklyData] = useState<WeeklyFormData[]>([]);

    const loadWeeklyData = async (weekNumber: number) => {
        try {
            const response = await fetch(`/api/read-weekly-data?week=${weekNumber}`);
            if (!response.ok) {
                throw new Error('Failed to load weekly data');
            }
            const data = await response.json();
            setSelectedWeekData(data);
        } catch (error) {
            console.error('Error loading weekly data:', error);
            alert('Failed to load weekly data for the selected week');
        }
    };

    useEffect(() => {
        const savedUserInfo = localStorage.getItem("currentMaternalUser");
        if (savedUserInfo) {
            const parsedUserInfo = JSON.parse(savedUserInfo);
            setUserInfo(parsedUserInfo);

            const savedAllData = localStorage.getItem(`weeklyData_${parsedUserInfo.userId}`);
            if (savedAllData) {
                setAllWeeklyData(JSON.parse(savedAllData));
            }
        }
    }, []);

    useEffect(() => {
        if (userInfo?.userId) {
            const savedAllData = localStorage.getItem(`weeklyData_${userInfo.userId}`);
            if (savedAllData) {
                setAllWeeklyData(JSON.parse(savedAllData));
            }
        }
    }, [userInfo?.userId]);

    useEffect(() => {
        if (weeklyData) {
            localStorage.setItem("maternalWeekly", JSON.stringify(weeklyData));
        }
    }, [weeklyData]);

    useEffect(() => {
        const loadAvailableWeeks = async () => {
            if (userInfo?.userId) {
                try {
                    const response = await fetch(`/api/weekly-data?userId=${userInfo.userId}`);
                    if (!response.ok) {
                        throw new Error('Failed to load weekly data');
                    }
                    const { weeklyData } = await response.json();
                    const weeks = weeklyData
                        .map((item: any) => item.weekNumber)
                        .sort((a: number, b: number) => a - b);

                    setAvailableWeeks(weeks);

                    // Set gestational age to next week after the most recent entry
                    if (weeks.length > 0) {
                        const lastWeek = Math.max(...weeks);
                        const nextWeek = lastWeek + 1;

                        setWeeklyData(prev => ({
                            ...prev,
                            gestationalAge: nextWeek
                        }));
                    } else {
                        // If no weeks are recorded yet, start with week 1
                        setWeeklyData(prev => ({
                            ...prev,
                            gestationalAge: 1
                        }));
                    }
                } catch (error) {
                    console.error('Error loading weekly data:', error);
                }
            }
        };

        loadAvailableWeeks();
    }, [userInfo?.userId]);

    const saveWeeklyDataToFile = async (data: WeeklyFormData) => {
        try {
            const weekNumber = Math.ceil(data.gestationalAge);
            const fileName = `week${weekNumber}.json`;
            const response = await fetch('/api/save-weekly-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data, fileName }),
            });

            if (!response.ok) {
                throw new Error('Failed to save weekly data');
            }
        } catch (error) {
            console.error('Error saving weekly data:', error);
            throw error;
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : value;
        setWeeklyData((prev: WeeklyFormData) => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submissionData = {
                ...weeklyData,
                userId: userInfo?.userId,
                weekNumber: Math.ceil(weeklyData.gestationalAge)
            };

            await saveWeeklyDataToFile(submissionData);

            const riskResponse = await fetch("/api/predict-risk", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(submissionData)
            });

            const data = await riskResponse.json();

            if (!riskResponse.ok) {
                throw new Error(data.error || 'Failed to get risk prediction');
            }

            const updatedWeeklyData = [...allWeeklyData, submissionData];
            localStorage.setItem(`weeklyData_${userInfo?.userId}`, JSON.stringify(updatedWeeklyData));
            setAllWeeklyData(updatedWeeklyData);

            setRiskPrediction(data);
            setShowPrediction(true);
            localStorage.removeItem("maternalWeekly");
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to submit weekly follow-up or get risk prediction';
            alert(errorMessage);
        }
    };

    const handleWeekSelect = async (week: number) => {
        await loadWeeklyData(week);
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
        <div className="fllup flex gap-6 p-6">
            <div className="w-1/3">
                <div className="bg-white p-4 rounded-xl shadow-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-600">Patient ID:</span>
                        <span className="text-blue-600">{userInfo?.userId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">Name:</span>
                        <span className="text-gray-800">{userInfo?.name}</span>
                    </div>
                </div>
                <PregnancyJourneyMap
                    weeklyData={allWeeklyData}
                    currentWeek={Math.ceil(weeklyData.gestationalAge)}
                    availableWeeks={availableWeeks}
                    onWeekSelect={handleWeekSelect}
                />
            </div>

            <div className="w-2/3">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-4">
                    <h2 className="text-2xl font-bold mb-4">Weekly Follow-Up</h2>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label htmlFor="gestationalAge" className="block text-sm font-medium text-gray-700">
                                    Gestational Age (weeks)
                                </label>
                                <span title="Current week of pregnancy" className="text-gray-400 cursor-help">❓</span>
                            </div>
                            <input
                                type="number"
                                id="gestationalAge"
                                name="gestationalAge"
                                value={weeklyData.gestationalAge}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                                required
                                readOnly
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label htmlFor="weightChange" className="block text-sm font-medium text-gray-700">
                                    Weight Change (kg)
                                </label>
                                <span title="Weight change since last visit" className="text-gray-400 cursor-help">❓</span>
                            </div>
                            <input
                                type="number"
                                step="0.1"
                                id="weightChange"
                                name="weightChange"
                                value={weeklyData.weightChange}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label htmlFor="bloodPressure" className="block text-sm font-medium text-gray-700">
                                    Blood Pressure
                                </label>
                                <span title="Current blood pressure reading (e.g., 120/80)" className="text-gray-400 cursor-help">❓</span>
                            </div>
                            <input
                                type="text"
                                id="bloodPressure"
                                name="bloodPressure"
                                value={weeklyData.bloodPressure}
                                onChange={handleChange}
                                placeholder="e.g., 120/80"
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label htmlFor="sleepHours" className="block text-sm font-medium text-gray-700">
                                    Sleep Hours
                                </label>
                                <span title="Average hours of sleep per night" className="text-gray-400 cursor-help">❓</span>
                            </div>
                            <input
                                type="number"
                                id="sleepHours"
                                name="sleepHours"
                                value={weeklyData.sleepHours}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                min="0"
                                max="24"
                                required
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="phq2Score" className="block text-sm font-medium text-gray-700">
                                        Depression Score (PHQ-2)
                                    </label>
                                    <span title="How often have you felt down in the last 2 weeks? Score from 0-6" className="text-gray-400 cursor-help">❓</span>
                                </div>
                                <input
                                    type="number"
                                    id="phq2Score"
                                    name="phq2Score"
                                    min="0"
                                    max="6"
                                    value={weeklyData.phq2Score}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="anxietyScore" className="block text-sm font-medium text-gray-700">
                                        Anxiety Score
                                    </label>
                                    <span title="How often have you felt anxious in the last 2 weeks? Score from 0-6" className="text-gray-400 cursor-help">❓</span>
                                </div>
                                <input
                                    type="number"
                                    id="anxietyScore"
                                    name="anxietyScore"
                                    min="0"
                                    max="6"
                                    value={weeklyData.anxietyScore}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="tirednessScore" className="block text-sm font-medium text-gray-700">
                                        Tiredness Score
                                    </label>
                                    <span title="Rate your tiredness from 1 (none) to 5 (always tired)" className="text-gray-400 cursor-help">❓</span>
                                </div>
                                <select
                                    id="tirednessScore"
                                    name="tirednessScore"
                                    value={weeklyData.tirednessScore}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                >
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <option key={num} value={num}>
                                            {num} - {num === 1 ? 'None' : num === 5 ? 'Always Tired' : `Level ${num}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="stressLevel" className="block text-sm font-medium text-gray-700">
                                        Stress Level (1-5)
                                    </label>
                                    <span title="1 = Low, 5 = High" className="text-gray-400 cursor-help">❓</span>
                                </div>
                                <input
                                    type="number"
                                    id="stressLevel"
                                    name="stressLevel"
                                    value={weeklyData.stressLevel}
                                    onChange={handleChange}
                                    min="1"
                                    max="5"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="supportScore" className="block text-sm font-medium text-gray-700">
                                        Support Score (1-5)
                                    </label>
                                    <span title="1 = Low support, 5 = High support" className="text-gray-400 cursor-help">❓</span>
                                </div>
                                <input
                                    type="number"
                                    id="supportScore"
                                    name="supportScore"
                                    value={weeklyData.supportScore}
                                    onChange={handleChange}
                                    min="1"
                                    max="5"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="bleedingEpisodes"
                                    name="bleedingEpisodes"
                                    checked={weeklyData.bleedingEpisodes}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                                <label htmlFor="bleedingEpisodes" className="text-sm text-gray-700">
                                    Bleeding Episodes
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="painCramping"
                                    name="painCramping"
                                    checked={weeklyData.painCramping}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                                <label htmlFor="painCramping" className="text-sm text-gray-700">
                                    Pain/Cramping
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="dizzinessEpisodes" className="block text-sm font-medium text-gray-700">
                                        Dizziness Episodes
                                    </label>
                                    <span title="Number of dizzy spells in the past week" className="text-gray-400 cursor-help">❓</span>
                                </div>
                                <input
                                    type="number"
                                    id="dizzinessEpisodes"
                                    name="dizzinessEpisodes"
                                    value={weeklyData.dizzinessEpisodes}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="muac" className="block text-sm font-medium text-gray-700">
                                        MUAC (cm)
                                    </label>
                                    <span title="Mid-Upper Arm Circumference measurement in centimeters" className="text-gray-400 cursor-help">❓</span>
                                </div>
                                <input
                                    type="number"
                                    id="muac"
                                    name="muac"
                                    step="0.1"
                                    value={weeklyData.muac}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="ironTablets" className="block text-sm font-medium text-gray-700">
                                        Iron Tablets Taken
                                    </label>
                                    <span title="Number of iron tablets taken in the past week" className="text-gray-400 cursor-help">❓</span>
                                </div>
                                <input
                                    type="number"
                                    id="ironTablets"
                                    name="ironTablets"
                                    value={weeklyData.ironTablets}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="dietaryIron" className="block text-sm font-medium text-gray-700">
                                        Dietary Iron Score
                                    </label>
                                    <span title="Rate your iron-rich food intake (1-5)" className="text-gray-400 cursor-help">❓</span>
                                </div>
                                <select
                                    id="dietaryIron"
                                    name="dietaryIron"
                                    value={weeklyData.dietaryIron}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                >
                                    {[0, 1, 2, 3, 4, 5].map(num => (
                                        <option key={num} value={num}>
                                            {num} - {num === 0 ? 'None' : num === 5 ? 'Excellent' : `Level ${num}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="thirstFrequency" className="block text-sm font-medium text-gray-700">
                                        Thirst Frequency
                                    </label>
                                    <span title="How often do you feel thirsty? (1-5)" className="text-gray-400 cursor-help">❓</span>
                                </div>
                                <select
                                    id="thirstFrequency"
                                    name="thirstFrequency"
                                    value={weeklyData.thirstFrequency}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                >
                                    {[0, 1, 2, 3, 4, 5].map(num => (
                                        <option key={num} value={num}>
                                            {num} - {num === 0 ? 'Normal' : num === 5 ? 'Extremely Thirsty' : `Level ${num}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="urinationFrequency" className="block text-sm font-medium text-gray-700">
                                        Urination Frequency
                                    </label>
                                    <span title="How often do you urinate? (1-5)" className="text-gray-400 cursor-help">❓</span>
                                </div>
                                <select
                                    id="urinationFrequency"
                                    name="urinationFrequency"
                                    value={weeklyData.urinationFrequency}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                >
                                    {[0, 1, 2, 3, 4, 5].map(num => (
                                        <option key={num} value={num}>
                                            {num} - {num === 0 ? 'Normal' : num === 5 ? 'Very Frequent' : `Level ${num}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="bloodSugar" className="block text-sm font-medium text-gray-700">
                                        Blood Sugar Level
                                    </label>
                                    <span title="Current blood sugar reading (mg/dL)" className="text-gray-400 cursor-help">❓</span>
                                </div>
                                <input
                                    type="number"
                                    id="bloodSugar"
                                    name="bloodSugar"
                                    value={weeklyData.bloodSugar}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="appetiteScore" className="block text-sm font-medium text-gray-700">
                                        Appetite Score
                                    </label>
                                    <span title="Rate your appetite (1-5)" className="text-gray-400 cursor-help">❓</span>
                                </div>
                                <select
                                    id="appetiteScore"
                                    name="appetiteScore"
                                    value={weeklyData.appetiteScore}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                >
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <option key={num} value={num}>
                                            {num} - {num === 1 ? 'Poor' : num === 5 ? 'Excellent' : `Level ${num}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="dietaryDiversity" className="block text-sm font-medium text-gray-700">
                                        Dietary Diversity
                                    </label>
                                    <span title="Number of different food groups consumed daily" className="text-gray-400 cursor-help">❓</span>
                                </div>
                                <input
                                    type="number"
                                    id="dietaryDiversity"
                                    name="dietaryDiversity"
                                    value={weeklyData.dietaryDiversity}
                                    onChange={handleChange}
                                    min="0"
                                    max="10"
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label htmlFor="mealFrequency" className="block text-sm font-medium text-gray-700">
                                    Daily Meals
                                </label>
                                <span title="Number of meals per day" className="text-gray-400 cursor-help">❓</span>
                            </div>
                            <input
                                type="number"
                                id="mealFrequency"
                                name="mealFrequency"
                                value={weeklyData.mealFrequency}
                                onChange={handleChange}
                                min="0"
                                max="10"
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label htmlFor="physicalActivity" className="block text-sm font-medium text-gray-700">
                                    Physical Activity (minutes/day)
                                </label>
                                <span title="Average minutes of light exercise per day" className="text-gray-400 cursor-help">❓</span>
                            </div>
                            <input
                                type="number"
                                id="physicalActivity"
                                name="physicalActivity"
                                value={weeklyData.physicalActivity}
                                onChange={handleChange}
                                min="0"
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="swelling"
                                    name="swelling"
                                    checked={weeklyData.swelling}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                                <label htmlFor="swelling" className="text-sm text-gray-700">
                                    Swelling (hands/feet)
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="paleness"
                                    name="paleness"
                                    checked={weeklyData.paleness}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                                <label htmlFor="paleness" className="text-sm text-gray-700">
                                    Unusual Paleness
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="hairCondition"
                                    name="hairCondition"
                                    checked={weeklyData.hairCondition}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                                <label htmlFor="hairCondition" className="text-sm text-gray-700">
                                    Poor Hair Condition
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="skinCondition"
                                    name="skinCondition"
                                    checked={weeklyData.skinCondition}
                                    onChange={handleChange}
                                    className="rounded border-gray-300 text-blue-600"
                                />
                                <label htmlFor="skinCondition" className="text-sm text-gray-700">
                                    Poor Skin Condition
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="slowHealingWounds"
                                name="slowHealingWounds"
                                checked={weeklyData.slowHealingWounds}
                                onChange={handleChange}
                                className="rounded border-gray-300 text-blue-600"
                            />
                            <label htmlFor="slowHealingWounds" className="text-sm text-gray-700">
                                Slow Healing Wounds
                            </label>
                        </div>

                        <div className="mt-6">
                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Submit Weekly Follow-Up
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {showPrediction && riskPrediction && (
                <RiskPrediction
                    riskLevel={riskPrediction}
                    onClose={() => setShowPrediction(false)}
                    setPage={onBack}
                />
            )}
        </div>
    );
};
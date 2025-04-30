"use client";
import React, { useState, useEffect } from "react";
import { MaternalFormData } from "../types/forms";

interface MaternalRegistrationFormProps {
  onComplete: () => void;
}

function generateUserId(): string {
  return 'MAT-' + Date.now().toString(36).toUpperCase() + '-' + 
         Math.random().toString(36).substring(2, 7).toUpperCase();
}

export const MaternalRegistrationForm: React.FC<MaternalRegistrationFormProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState<MaternalFormData>(() => {
    const saved = localStorage.getItem("maternalRegistration");
    const userId = generateUserId();
    const baseData = {
      userId,
      name: "",
      age: 0,
      contact: "",
      gravida: 0,
      parity: 0,
      educationLevel: 0,
      householdIncome: "",
      distanceToClinic: 0,
      bmi: 0,
      historyMiscarriage: false,
      historyPretermBirth: false,
      uterineSurgery: false,
      multiplePregnancy: false,
      previousDepression: false,
      familyHistoryDiabetes: false,
      previousAnaemia: false,
      thyroidDisorder: false,
      baselineBloodSugar: 0,
      folicAcidIntake: 0,
      registrationDate: new Date().toISOString(),
      weeklyData: []
    };
    return saved ? JSON.parse(saved) : baseData;
  });

  useEffect(() => {
    localStorage.setItem("maternalRegistration", JSON.stringify(formData));
    localStorage.setItem("currentMaternalUser", JSON.stringify({
      userId: formData.userId,
      name: formData.name
    }));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = (e.target as HTMLInputElement).type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : value;
    setFormData((prev: MaternalFormData) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      // Store both user ID and name
      localStorage.setItem("currentMaternalUser", JSON.stringify({
        userId: formData.userId,
        name: formData.name
      }));
      
      // alert("Registration submitted successfully! Your ID is " + formData.userId);
      localStorage.removeItem("maternalRegistration");
      onComplete();
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred. Please try again.')
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-4 w-full max-w-md mx-auto mt-12">
      <h2 className="text-2xl font-bold mb-4">Maternal Registration</h2>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <span title="Enter your full legal name as it appears on your medical records" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
          <span title="Enter your age in years" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="number"
          name="age"
          id="age"
          value={formData.age}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact</label>
          <span title="Enter your contact number" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="text"
          name="contact"
          id="contact"
          value={formData.contact}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="gravida" className="block text-sm font-medium text-gray-700">Gravida</label>
          <span title="Enter the number of times you have been pregnant" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="number"
          name="gravida"
          id="gravida"
          value={formData.gravida}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="parity" className="block text-sm font-medium text-gray-700">Parity</label>
          <span title="Enter the number of times you have given birth" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="number"
          name="parity"
          id="parity"
          value={formData.parity}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700">Education Level</label>
          <span title="Enter your highest level of education" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="number"
          name="educationLevel"
          id="educationLevel"
          value={formData.educationLevel}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="householdIncome" className="block text-sm font-medium text-gray-700">Household Income</label>
          <span title="Enter your total household income" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="text"
          name="householdIncome"
          id="householdIncome"
          value={formData.householdIncome}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="distanceToClinic" className="block text-sm font-medium text-gray-700">Distance to Clinic (in Kilometers km)</label>
          <span title="Enter the distance to the nearest clinic in kilometers" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="number"
          name="distanceToClinic"
          id="distanceToClinic"
          value={formData.distanceToClinic}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="bmi" className="block text-sm font-medium text-gray-700">BMI</label>
          <span title="Enter your Body Mass Index" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="number"
          name="bmi"
          id="bmi"
          value={formData.bmi}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="historyMiscarriage" className="block text-sm font-medium text-gray-700">History of Miscarriage</label>
          <span title="Check if you have a history of miscarriage" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="checkbox"
          name="historyMiscarriage"
          id="historyMiscarriage"
          checked={formData.historyMiscarriage}
          onChange={handleChange}
          className="input rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="historyPretermBirth" className="block text-sm font-medium text-gray-700">History of Preterm Birth</label>
          <span title="Check if you have a history of preterm birth" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="checkbox"
          name="historyPretermBirth"
          id="historyPretermBirth"
          checked={formData.historyPretermBirth}
          onChange={handleChange}
          className="input rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="uterineSurgery" className="block text-sm font-medium text-gray-700">Uterine Surgery</label>
          <span title="Check if you have had uterine surgery" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="checkbox"
          name="uterineSurgery"
          id="uterineSurgery"
          checked={formData.uterineSurgery}
          onChange={handleChange}
          className="input rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="multiplePregnancy" className="block text-sm font-medium text-gray-700">Multiple Pregnancy</label>
          <span title="Check if you have had multiple pregnancies" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="checkbox"
          name="multiplePregnancy"
          id="multiplePregnancy"
          checked={formData.multiplePregnancy}
          onChange={handleChange}
          className="input rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="previousDepression" className="block text-sm font-medium text-gray-700">Previous Depression</label>
          <span title="Check if you have had previous depression" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="checkbox"
          name="previousDepression"
          id="previousDepression"
          checked={formData.previousDepression}
          onChange={handleChange}
          className="input rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="familyHistoryDiabetes" className="block text-sm font-medium text-gray-700">Family History of Diabetes</label>
          <span title="Check if you have a family history of diabetes" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="checkbox"
          name="familyHistoryDiabetes"
          id="familyHistoryDiabetes"
          checked={formData.familyHistoryDiabetes}
          onChange={handleChange}
          className="input rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="previousAnaemia" className="block text-sm font-medium text-gray-700">Previous Anaemia</label>
          <span title="Check if you have had previous anaemia" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="checkbox"
          name="previousAnaemia"
          id="previousAnaemia"
          checked={formData.previousAnaemia}
          onChange={handleChange}
          className="input rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="thyroidDisorder" className="block text-sm font-medium text-gray-700">Thyroid Disorder</label>
          <span title="Check if you have a thyroid disorder" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="checkbox"
          name="thyroidDisorder"
          id="thyroidDisorder"
          checked={formData.thyroidDisorder}
          onChange={handleChange}
          className="input rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="baselineBloodSugar" className="block text-sm font-medium text-gray-700">Baseline Blood Sugar</label>
          <span title="Enter your baseline blood sugar level" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="number"
          name="baselineBloodSugar"
          id="baselineBloodSugar"
          value={formData.baselineBloodSugar}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="folicAcidIntake" className="block text-sm font-medium text-gray-700">Folic Acid Intake</label>
          <span title="Enter your folic acid intake in micrograms" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="number"
          name="folicAcidIntake"
          id="folicAcidIntake"
          value={formData.folicAcidIntake}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Submit Registration
      </button>
    </form>
  );
};
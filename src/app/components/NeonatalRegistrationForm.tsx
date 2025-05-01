"use client";
import React, { useState, useEffect } from "react";
import { NeonatalFormData } from "../types/forms";

interface NeonatalRegistrationFormProps {
  onComplete: () => void;
}

function generateUserId(): string {
  return 'NEO-' + Date.now().toString(36).toUpperCase() + '-' + 
         Math.random().toString(36).substring(2, 7).toUpperCase();
}

export const NeonatalRegistrationForm: React.FC<NeonatalRegistrationFormProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState<NeonatalFormData>(() => {
    const saved = localStorage.getItem("neonatalRegistration");
    const userId = generateUserId();
    const baseData = {
      userId,
      motherName: "",
      motherAge: 0,
      contact: "",
      deliveryDate: "",
      gestationalAge: 0,
      birthWeight: 0,
      birthLength: 0,
      headCircumference: 0,
      apgarScore: 0,
      multipleBirth: false,
      birthComplications: false,
      requiresNICU: false,
      jaundice: false,
      respiratoryIssues: false,
      feedingIssues: false,
      congenitalAnomalies: false,
      maternalDiabetes: false,
      maternalHypertension: false,
      registrationDate: new Date().toISOString()
    };
    return saved ? JSON.parse(saved) : baseData;
  });

  useEffect(() => {
    localStorage.setItem("neonatalRegistration", JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : value;
    setFormData((prev: NeonatalFormData) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/neonatal-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      localStorage.setItem("currentNeonatalUser", JSON.stringify({
        userId: formData.userId,
        motherName: formData.motherName
      }));

      localStorage.removeItem("neonatalRegistration");
      onComplete();
    } catch (error) {
      console.error('Submission error:', error);
      alert('An error occurred. Please try again.')
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-4 w-full max-w-md mx-auto mt-12">
      <h2 className="text-2xl font-bold mb-4">Neonatal Registration</h2>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="motherName" className="block text-sm font-medium text-gray-700">Mother's Name</label>
          <span title="Enter mother's full legal name" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="text"
          name="motherName"
          id="motherName"
          value={formData.motherName}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="motherAge" className="block text-sm font-medium text-gray-700">Mother's Age</label>
          <span title="Enter mother's age in years" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="number"
          name="motherAge"
          id="motherAge"
          value={formData.motherAge}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact</label>
          <span title="Enter contact number for medical communications" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="text"
          name="contact"
          id="contact"
          value={formData.contact}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700">Delivery Date</label>
          <span title="Enter the date of delivery" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="date"
          name="deliveryDate"
          id="deliveryDate"
          value={formData.deliveryDate}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="gestationalAge" className="block text-sm font-medium text-gray-700">Gestational Age (weeks)</label>
          <span title="Enter gestational age at birth in weeks" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="number"
          name="gestationalAge"
          id="gestationalAge"
          value={formData.gestationalAge}
          onChange={handleChange}
          min="20"
          max="45"
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="birthWeight" className="block text-sm font-medium text-gray-700">Birth Weight (grams)</label>
          <span title="Enter birth weight in grams" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="number"
          name="birthWeight"
          id="birthWeight"
          value={formData.birthWeight}
          onChange={handleChange}
          min="300"
          max="6000"
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="birthLength" className="block text-sm font-medium text-gray-700">Birth Length (cm)</label>
          <span title="Enter birth length in centimeters" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="number"
          name="birthLength"
          id="birthLength"
          value={formData.birthLength}
          onChange={handleChange}
          min="20"
          max="65"
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="headCircumference" className="block text-sm font-medium text-gray-700">Head Circumference (cm)</label>
          <span title="Enter head circumference in centimeters" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="number"
          name="headCircumference"
          id="headCircumference"
          value={formData.headCircumference}
          onChange={handleChange}
          min="20"
          max="40"
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="apgarScore" className="block text-sm font-medium text-gray-700">APGAR Score</label>
          <span title="Enter 5-minute APGAR score (0-10)" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          type="number"
          name="apgarScore"
          id="apgarScore"
          value={formData.apgarScore}
          onChange={handleChange}
          min="0"
          max="10"
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="multipleBirth"
            id="multipleBirth"
            checked={formData.multipleBirth}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600"
          />
          <label htmlFor="multipleBirth" className="text-sm text-gray-700">Multiple Birth</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="birthComplications"
            id="birthComplications"
            checked={formData.birthComplications}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600"
          />
          <label htmlFor="birthComplications" className="text-sm text-gray-700">Birth Complications</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="requiresNICU"
            id="requiresNICU"
            checked={formData.requiresNICU}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600"
          />
          <label htmlFor="requiresNICU" className="text-sm text-gray-700">Requires NICU</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="jaundice"
            id="jaundice"
            checked={formData.jaundice}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600"
          />
          <label htmlFor="jaundice" className="text-sm text-gray-700">Jaundice</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="respiratoryIssues"
            id="respiratoryIssues"
            checked={formData.respiratoryIssues}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600"
          />
          <label htmlFor="respiratoryIssues" className="text-sm text-gray-700">Respiratory Issues</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="feedingIssues"
            id="feedingIssues"
            checked={formData.feedingIssues}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600"
          />
          <label htmlFor="feedingIssues" className="text-sm text-gray-700">Feeding Issues</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="congenitalAnomalies"
            id="congenitalAnomalies"
            checked={formData.congenitalAnomalies}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600"
          />
          <label htmlFor="congenitalAnomalies" className="text-sm text-gray-700">Congenital Anomalies</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="maternalDiabetes"
            id="maternalDiabetes"
            checked={formData.maternalDiabetes}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600"
          />
          <label htmlFor="maternalDiabetes" className="text-sm text-gray-700">Maternal Diabetes</label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="maternalHypertension"
            id="maternalHypertension"
            checked={formData.maternalHypertension}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600"
          />
          <label htmlFor="maternalHypertension" className="text-sm text-gray-700">Maternal Hypertension</label>
        </div>
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
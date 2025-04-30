"use client";
import React, { useState, useEffect } from "react";

interface MaternalFormData {
  name: string;
  age: number;
  contact: string;
  gravida: number;
  parity: number;
  educationLevel: number; // 0 or 1
  householdIncome: string; // <5k / 5-10k / >10k
  distanceToClinic: number;
  bmi: number;
  historyMiscarriage: boolean;
  historyPretermBirth: boolean;
  uterineSurgery: boolean;
  multiplePregnancy: boolean;
  previousDepression: boolean;
  familyHistoryDiabetes: boolean;
  previousAnaemia: boolean;
  thyroidDisorder: boolean;
  baselineBloodSugar: number;
  folicAcidIntake: number; // 0-7
}

interface WeeklyFormData {
  gestationalAge: number;
  weightChange: number;
  bloodPressure: string;
  sleepHours: number;
  stressLevel: number;
  supportScore: number;
  phq2Score: number;
  anxietyScore: number;
  bleedingEpisodes: boolean;
  painCramping: boolean;
  contractionCount: boolean;
  fluidLeak: boolean;
  utiSymptoms: boolean;
  tirednessScore: number;
  dizzinessEpisodes: number;
  paleness: boolean;
  ironTablets: number;
  muac: number;
  dietaryIron: number;
  thirstFrequency: number;
  urinationFrequency: number;
  bloodSugar: number;
  appetiteScore: number;
  dietaryDiversity: number;
  mealFrequency: number;
  swelling: boolean;
  hairCondition: boolean;
  skinCondition: boolean;
  physicalActivity: number;
  slowHealingWounds: boolean;
}

// Add this interface with the existing interfaces
interface Message {
  text: string;
  sender: 'user' | 'ai';
}

const App: React.FC = () => {
  const [page, setPage] = useState<string>("main");
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const handleMainSelection = (selection: string) => {
    setPage(selection);
  };

  const handleMaternalSelection = (selection: string) => {
    if (selection === "registration") {
      setPage("maternal-registration");
    } else if (selection === "weekly-followup") {
      setPage("maternal-weekly");
    }
  };

  const handleRegistrationComplete = () => {
    if (window.confirm("Registration Complete. Proceed to Weekly Follow-Up Form?")) {
      setPage("maternal-weekly");
    } else {
      setPage("maternal-menu");
    }
  };

  // Add these state declarations at the beginning of the App component
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Add this function inside the App component
  const handleStartListening = async () => {
    if (isListening) {
      setIsListening(false);
      if (wsConnection) {
        wsConnection.close();
        setWsConnection(null);
      }
      return;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsSupported(false);
        throw new Error('Voice recognition not supported in this browser');
      }

      // Start WebSocket connection
      const ws = new WebSocket('ws://localhost:8000/ws/voice');

      ws.onopen = async () => {
        setWsConnection(ws);
        setIsListening(true);
        // Add your start listening logic here
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            channelCount: 1,
            sampleRate: 16000
          } 
        });
  
        // Create AudioContext
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(16384, 1, 1);
  
        source.connect(processor);
        processor.connect(audioContext.destination);
  
        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            // Convert to 16-bit PCM WAV
            const inputData = e.inputBuffer.getChannelData(0);
            const wav = convertToWav(inputData, 16000);
            ws.send(wav);
          }
        };
  
        // Cleanup function
        return () => {
          processor.disconnect();
          source.disconnect();
          stream.getTracks().forEach(track => track.stop());
          audioContext.close();
        };
      };
  
      // ... rest of your WebSocket handlers (onmessage, onerror)
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        text: 'Error accessing microphone. Please check permissions.',
        sender: 'ai'
      }]);
      setIsListening(false);
    }
  };


  const convertToWav = (audioData: Float32Array, sampleRate: number): Blob => {
    const buffer = new ArrayBuffer(44 + audioData.length * 2);
    const view = new DataView(buffer);
  
    // Write WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
  
    writeString(0, 'RIFF');
    view.setUint32(4, 32 + audioData.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, audioData.length * 2, true);
  
    // Write audio data
    const volume = 0.5;
    for (let i = 0; i < audioData.length; i++) {
      view.setInt16(44 + i * 2, audioData[i] * 0x7FFF * volume, true);
    }
  
    return new Blob([buffer], { type: 'audio/wav' });
  };

  useEffect(() => {
    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [wsConnection]);

  return (
    <div className="mainmenu p-6 min-h-screen flex flex-col items-center justify-center">
      {page === "main" && (
        <div className="space-y-6 text-center">
          <h3 className="text-2xl font-bold mb-3">Hi there, Please choose from the options below</h3>
          <div className="space-y-4">
            <button onClick={() => handleMainSelection("voice-chat")} className="vchat animate-fade px-6 py-3 bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-600">Voice Assistant Chat</button>
            <button onClick={() => handleMainSelection("maternal-menu")} className="mmenu animate-fade px-6 py-3 bg-green-500 text-white rounded-xl shadow-md hover:bg-green-600">Maternal Risk Section</button>
            <button onClick={() => alert("Neonatal Risk Section Coming Soon")} className="nmenu animate-fade px-6 py-3 bg-yellow-500 text-white rounded-xl shadow-md hover:bg-yellow-600">Neonatal Risk Section</button>
          </div>
        </div>
      )}

      {/* {page === "voice-chat" && (
        <div className="page-transition space-y-6 text-center relative">
          <button onClick={() => setPage("main")} className="fixed top-10 right-20 px-4 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500 z-50">Back</button>
          <h2 className="text-3xl font-semibold">Voice Assistant Chat</h2>
          <p className="text-gray-700">Voice Assistant functionality coming soon...</p>
        </div>
      )} */}

      {page === "voice-chat" && (
        <div className="page-transition space-y-6 text-center relative w-full max-w-2xl mx-auto">
          <button onClick={() => setPage("main")} className="fixed top-10 right-20 px-4 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500 z-50">Back</button>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-semibold mb-6">Voice Assistant</h2>

            <div className="avatar-container mb-8">
              <div className="w-32 h-32 mx-auto rounded-full bg-blue-100 flex items-center justify-center relative">
                {/* Animated avatar circle that pulses when speaking */}
                <div className={`absolute inset-0 rounded-full ${isListening ? 'animate-pulse-ring' : ''}`}></div>
                <img
                  src="/nurse-avatar.png"
                  alt="AI Assistant Avatar"
                  className="w-24 h-24 rounded-full"
                />
              </div>
            </div>

            <div className="chat-container mb-6 min-h-[200px] bg-gray-50 rounded-xl p-4">
              {messages.map((msg, index) => (
                <div key={index} className={`mb-4 ${msg.sender === 'ai' ? 'text-left' : 'text-right'}`}>
                  <div className={`inline-block p-3 rounded-lg ${msg.sender === 'ai' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="controls flex items-center justify-center gap-4">
              <button
                onClick={handleStartListening}
                className={`p-4 rounded-full ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                  } text-white transition-colors`}
              >
                {isListening ? (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    Stop
                  </span>
                ) : (
                  <span>Start Speaking</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}


      {page === "maternal-menu" && (
        <div className="page-transition space-y-6 text-center relative">
          <button onClick={() => setPage("main")} className="fixed top-10 right-20 px-4 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500 z-50">Back</button>
          <h2 className="text-3xl font-semibold">Maternal Risk Section</h2>
          <div className="space-y-4">
            <button onClick={() => handleMaternalSelection("registration")} className="mmenu px-6 py-3 bg-purple-500 text-white rounded-xl shadow-md hover:bg-purple-600">Registration (First-Time User)</button>
            <button onClick={() => handleMaternalSelection("weekly-followup")} className="mmenu px-6 py-3 bg-pink-500 text-white rounded-xl shadow-md hover:bg-pink-600">Weekly Follow-Up</button>
          </div>
        </div>
      )}

      {page === "maternal-registration" && (
        <div className="page-transition relative w-full">
          <button onClick={() => setPage("maternal-menu")} className="fixed top-10 right-20 px-4 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500 z-50">Back</button>
          <MaternalRegistrationForm onComplete={handleRegistrationComplete} />
        </div>
      )}

      {page === "maternal-weekly" && (
        <div className="page-transition relative w-full">
          <button onClick={() => setPage("maternal-menu")} className="fixed top-10 right-20 px-4 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500 z-50">Back</button>
          <MaternalWeeklyFollowUpForm onBack={() => setPage("maternal-menu")} />
        </div>
      )}
    </div>
  );
};

interface MaternalRegistrationFormProps {
  onComplete: () => void;
}

const MaternalRegistrationForm: React.FC<MaternalRegistrationFormProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState<MaternalFormData>(() => {
    const saved = localStorage.getItem("maternalRegistration");
    return saved ? JSON.parse(saved) : {
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
      folicAcidIntake: 0
    };
  });

  useEffect(() => {
    localStorage.setItem("maternalRegistration", JSON.stringify(formData));
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;  // Add type to destructuring
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
      alert("Registration submitted successfully!");
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
        <input id="name" name="name" value={formData.name} onChange={handleChange} className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
          <span title="Your current age in years" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input id="age" name="age" value={formData.age} onChange={handleChange} type="number" className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="contact" className="block text-sm font-medium text-gray-700">Contact Details</label>
          <span title="Your primary phone number or email address for medical communications" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input id="contact" name="contact" value={formData.contact} onChange={handleChange} className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="gravida" className="block text-sm font-medium text-gray-700">Number of Pregnancies</label>
          <span title="Total number of times you have been pregnant, including current pregnancy" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input id="gravida" name="gravida" value={formData.gravida} onChange={handleChange} type="number" className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="parity" className="block text-sm font-medium text-gray-700">Number of Births</label>
          <span title="Number of pregnancies carried to viable gestational age (24 weeks or more)" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input id="parity" name="parity" value={formData.parity} onChange={handleChange} type="number" className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700">Education Level</label>
          <span title="Your highest completed level of education" className="text-gray-400 cursor-help">❓</span>
        </div>
        <select id="educationLevel" name="educationLevel" value={formData.educationLevel} onChange={handleChange} className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
          <option value="">Select Education Level</option>
          <option value="0">Primary/Secondary</option>
          <option value="1">Higher Education</option>
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="householdIncome" className="block text-sm font-medium text-gray-700">Household Income</label>
          <span title="Total monthly household income range" className="text-gray-400 cursor-help">❓</span>
        </div>
        <select id="householdIncome" name="householdIncome" value={formData.householdIncome} onChange={handleChange} className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
          <option value="">Select Household Income</option>
          <option value="<5k">Less than 5k</option>
          <option value="5-10k">5k - 10k</option>
          <option value=">10k">More than 10k</option>
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="distanceToClinic" className="block text-sm font-medium text-gray-700">Distance to Clinic (km)</label>
          <span title="Distance from your home to the nearest healthcare facility in kilometers" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input id="distanceToClinic" name="distanceToClinic" value={formData.distanceToClinic} onChange={handleChange} type="number" className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="bmi" className="block text-sm font-medium text-gray-700">BMI</label>
          <span title="Body Mass Index - Your weight in kilograms divided by your height in meters squared" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input id="bmi" name="bmi" value={formData.bmi} onChange={handleChange} type="number" step="0.1" className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
      </div>

      <fieldset className="space-y-2 border border-gray-300 rounded-md p-4">
        <div className="flex items-center gap-2 mb-4">
          <legend className="text-sm font-medium text-gray-700">Medical History</legend>
          <span title="Check all medical conditions that apply to your history" className="text-gray-400 cursor-help">❓</span>
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="historyMiscarriage" name="historyMiscarriage" checked={formData.historyMiscarriage} onChange={e => setFormData(prev => ({ ...prev, historyMiscarriage: e.target.checked }))} className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
          <label htmlFor="historyMiscarriage" className="flex items-center gap-2">
            History of Miscarriage
            <span title="Previous pregnancy losses before 20 weeks of gestation" className="text-gray-400 cursor-help">❓</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="historyPretermBirth" name="historyPretermBirth" checked={formData.historyPretermBirth} onChange={e => setFormData(prev => ({ ...prev, historyPretermBirth: e.target.checked }))} className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
          <label htmlFor="historyPretermBirth" className="flex items-center gap-2">
            History of Preterm Birth
            <span title="Previous births before 37 weeks of gestation" className="text-gray-400 cursor-help">❓</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="uterineSurgery" name="uterineSurgery" checked={formData.uterineSurgery} onChange={e => setFormData(prev => ({ ...prev, uterineSurgery: e.target.checked }))} className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
          <label htmlFor="uterineSurgery" className="flex items-center gap-2">
            Previous Uterine Surgery
            <span title="Any previous surgeries on your uterus, including C-sections" className="text-gray-400 cursor-help">❓</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="multiplePregnancy" name="multiplePregnancy" checked={formData.multiplePregnancy} onChange={e => setFormData(prev => ({ ...prev, multiplePregnancy: e.target.checked }))} className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
          <label htmlFor="multiplePregnancy" className="flex items-center gap-2">
            Multiple Pregnancy
            <span title="Current pregnancy with more than one fetus i.e twins or more" className="text-gray-400 cursor-help">❓</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="previousDepression" name="previousDepression" checked={formData.previousDepression} onChange={e => setFormData(prev => ({ ...prev, previousDepression: e.target.checked }))} className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
          <label htmlFor="previousDepression" className="flex items-center gap-2">
            Previous Depression
            <span title="History of diagnosed depression or mental health conditions" className="text-gray-400 cursor-help">❓</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="familyHistoryDiabetes" name="familyHistoryDiabetes" checked={formData.familyHistoryDiabetes} onChange={e => setFormData(prev => ({ ...prev, familyHistoryDiabetes: e.target.checked }))} className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
          <label htmlFor="familyHistoryDiabetes" className="flex items-center gap-2">
            Family History of Diabetes
            <span title="Close family members (parents, siblings) with diabetes" className="text-gray-400 cursor-help">❓</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="previousAnaemia" name="previousAnaemia" checked={formData.previousAnaemia} onChange={e => setFormData(prev => ({ ...prev, previousAnaemia: e.target.checked }))} className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
          <label htmlFor="previousAnaemia" className="flex items-center gap-2">
            Previous Anaemia
            <span title="History of low blood iron levels or anaemia diagnosis" className="text-gray-400 cursor-help">❓</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="thyroidDisorder" name="thyroidDisorder" checked={formData.thyroidDisorder} onChange={e => setFormData(prev => ({ ...prev, thyroidDisorder: e.target.checked }))} className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
          <label htmlFor="thyroidDisorder" className="flex items-center gap-2">
            Thyroid Disorder
            <span title="Any diagnosed thyroid condition (hypothyroidism or hyperthyroidism)" className="text-gray-400 cursor-help">❓</span>
          </label>
        </div>
      </fieldset>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="baselineBloodSugar" className="block text-sm font-medium text-gray-700">Baseline Blood Sugar</label>
          <span title="Your fasting blood sugar level in mg/dL" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input id="baselineBloodSugar" name="baselineBloodSugar" value={formData.baselineBloodSugar} onChange={handleChange} type="number" step="0.1" className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="folicAcidIntake" className="block text-sm font-medium text-gray-700">Folic Acid Intake (days/week)</label>
          <span title="Number of days per week you take folic acid supplements (0-7)" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input id="folicAcidIntake" name="folicAcidIntake" value={formData.folicAcidIntake} onChange={handleChange} type="number" min="0" max="7" className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
      </div>

      <button type="submit" className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Submit Registration</button>
    </form>
  );
};

interface MaternalWeeklyFollowUpFormProps {
  onBack: () => void;
}

const MaternalWeeklyFollowUpForm: React.FC<MaternalWeeklyFollowUpFormProps> = ({ onBack }) => {
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
      slowHealingWounds: false
    };
  });

  useEffect(() => {
    localStorage.setItem("maternalWeekly", JSON.stringify(weeklyData));
  }, [weeklyData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setWeeklyData((prev: WeeklyFormData) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/weekly-followup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(weeklyData)
      });
      alert("Follow-Up Submitted Successfully. Prediction and Recommendations Displayed.");
      localStorage.removeItem("maternalWeekly");
      onBack();
    } catch (error) {
      alert("Failed to submit weekly follow-up.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-4 w-full max-w-md mx-auto mt-12">
      <h2 className="text-2xl font-bold mb-4">Weekly Follow-Up</h2>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="gestationalAge" className="block text-sm font-medium text-gray-700">Gestational Age (weeks)</label>
          <span title="How many weeks along are you in your pregnancy?" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          id="gestationalAge"
          name="gestationalAge"
          type="number"
          value={weeklyData.gestationalAge}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="weightChange" className="block text-sm font-medium text-gray-700">Weight Change (kg)</label>
          <span title="How many kilograms gained or lost since last week?" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          id="weightChange"
          name="weightChange"
          type="number"
          step="0.1"
          value={weeklyData.weightChange}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="bloodPressure" className="block text-sm font-medium text-gray-700">Blood Pressure</label>
          <span title="Record systolic/diastolic blood pressure in mmHg (e.g., 120/80)" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          id="bloodPressure"
          name="bloodPressure"
          value={weeklyData.bloodPressure}
          onChange={handleChange}
          placeholder="e.g., 120/80"
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="sleepHours" className="block text-sm font-medium text-gray-700">Sleep Hours</label>
          <span title="Average hours of sleep per night last week" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          id="sleepHours"
          name="sleepHours"
          type="number"
          step="0.5"
          min="0"
          max="24"
          value={weeklyData.sleepHours}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="stressLevel" className="block text-sm font-medium text-gray-700">Stress Level</label>
          <span title="Rate your stress level from 1 (none) to 5 (very high)" className="text-gray-400 cursor-help">❓</span>
        </div>
        <select
          id="stressLevel"
          name="stressLevel"
          value={weeklyData.stressLevel}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          {[1, 2, 3, 4, 5].map(num => (
            <option key={num} value={num}>{num} - {num === 1 ? 'None' : num === 5 ? 'Very High' : `Level ${num}`}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="supportScore" className="block text-sm font-medium text-gray-700">Family Support Score</label>
          <span title="Rate your family support from 1 (none) to 5 (very good)" className="text-gray-400 cursor-help">❓</span>
        </div>
        <select
          id="supportScore"
          name="supportScore"
          value={weeklyData.supportScore}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          {[1, 2, 3, 4, 5].map(num => (
            <option key={num} value={num}>{num} - {num === 1 ? 'None' : num === 5 ? 'Very Good' : `Level ${num}`}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="phq2Score" className="block text-sm font-medium text-gray-700">Depression Score (PHQ-2)</label>
          <span title="How often have you felt down in the last 2 weeks? Score from 0-6" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          id="phq2Score"
          name="phq2Score"
          type="number"
          min="0"
          max="6"
          value={weeklyData.phq2Score}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="anxietyScore" className="block text-sm font-medium text-gray-700">Anxiety Score</label>
          <span title="How often have you felt anxious in the last 2 weeks? Score from 0-6" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          id="anxietyScore"
          name="anxietyScore"
          type="number"
          min="0"
          max="6"
          value={weeklyData.anxietyScore}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <fieldset className="space-y-2 border border-gray-300 rounded-md p-4">
        <legend className="text-sm font-medium text-gray-700 mb-2">Symptoms Check</legend>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="bleedingEpisodes" name="bleedingEpisodes" checked={weeklyData.bleedingEpisodes} onChange={e => setWeeklyData(prev => ({ ...prev, bleedingEpisodes: e.target.checked }))} className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
          <label htmlFor="bleedingEpisodes" className="flex items-center gap-2">
            Bleeding Episodes
            <span title="Any spotting or bleeding this week?" className="text-gray-400 cursor-help">❓</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="painCramping" name="painCramping" checked={weeklyData.painCramping} onChange={e => setWeeklyData(prev => ({ ...prev, painCramping: e.target.checked }))} className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
          <label htmlFor="painCramping" className="flex items-center gap-2">
            Pain/Cramping
            <span title="Belly cramps more than 2 times per day?" className="text-gray-400 cursor-help">❓</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="contractionCount" name="contractionCount" checked={weeklyData.contractionCount} onChange={e => setWeeklyData(prev => ({ ...prev, contractionCount: e.target.checked }))} className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
          <label htmlFor="contractionCount" className="flex items-center gap-2">
            Contractions
            <span title="Hard tightenings more than 4 times per day?" className="text-gray-400 cursor-help">❓</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="fluidLeak" name="fluidLeak" checked={weeklyData.fluidLeak} onChange={e => setWeeklyData(prev => ({ ...prev, fluidLeak: e.target.checked }))} className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
          <label htmlFor="fluidLeak" className="flex items-center gap-2">
            Fluid Leak
            <span title="Any water leak or wetness low down?" className="text-gray-400 cursor-help">❓</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="utiSymptoms" name="utiSymptoms" checked={weeklyData.utiSymptoms} onChange={e => setWeeklyData(prev => ({ ...prev, utiSymptoms: e.target.checked }))} className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
          <label htmlFor="utiSymptoms" className="flex items-center gap-2">
            UTI Symptoms
            <span title="Burning when urinating or smelly discharge?" className="text-gray-400 cursor-help">❓</span>
          </label>
        </div>
      </fieldset>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="tirednessScore" className="block text-sm font-medium text-gray-700">Tiredness Score</label>
          <span title="Rate your tiredness from 1 (none) to 5 (always tired)" className="text-gray-400 cursor-help">❓</span>
        </div>
        <select
          id="tirednessScore"
          name="tirednessScore"
          value={weeklyData.tirednessScore}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          {[1, 2, 3, 4, 5].map(num => (
            <option key={num} value={num}>{num} - {num === 1 ? 'None' : num === 5 ? 'Always Tired' : `Level ${num}`}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="dizzinessEpisodes" className="block text-sm font-medium text-gray-700">Dizziness Episodes</label>
          <span title="How many dizzy spells this week?" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          id="dizzinessEpisodes"
          name="dizzinessEpisodes"
          type="number"
          min="0"
          value={weeklyData.dizzinessEpisodes}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <fieldset className="space-y-2 border border-gray-300 rounded-md p-4">
        <legend className="text-sm font-medium text-gray-700 mb-2">Physical Assessment</legend>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="paleness" name="paleness" checked={weeklyData.paleness} onChange={e => setWeeklyData(prev => ({ ...prev, paleness: e.target.checked }))} className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
          <label htmlFor="paleness" className="flex items-center gap-2">
            Paleness
            <span title="Very pale inner eyelid or palm?" className="text-gray-400 cursor-help">❓</span>
          </label>
        </div>

        <div className="space-y-2 mt-2">
          <div className="flex items-center gap-2">
            <label htmlFor="muac" className="block text-sm font-medium text-gray-700">MUAC (cm)</label>
            <span title="Mid-upper arm circumference measurement in centimeters" className="text-gray-400 cursor-help">❓</span>
          </div>
          <input
            id="muac"
            name="muac"
            type="number"
            step="0.1"
            value={weeklyData.muac}
            onChange={handleChange}
            className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      </fieldset>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="ironTablets" className="block text-sm font-medium text-gray-700">Iron Tablets Taken</label>
          <span title="How many iron tablets did you take last week? (0-7)" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          id="ironTablets"
          name="ironTablets"
          type="number"
          min="0"
          max="7"
          value={weeklyData.ironTablets}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="dietaryIron" className="block text-sm font-medium text-gray-700">Dietary Iron Sources</label>
          <span title="How many servings of leafy greens/beans per day?" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          id="dietaryIron"
          name="dietaryIron"
          type="number"
          min="0"
          value={weeklyData.dietaryIron}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="thirstFrequency" className="block text-sm font-medium text-gray-700">Thirst Frequency</label>
          <span title="How many days were you very thirsty this week?" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          id="thirstFrequency"
          name="thirstFrequency"
          type="number"
          min="0"
          max="7"
          value={weeklyData.thirstFrequency}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="urinationFrequency" className="block text-sm font-medium text-gray-700">Night Urination Frequency</label>
          <span title="How many times did you urinate at night this week?" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          id="urinationFrequency"
          name="urinationFrequency"
          type="number"
          min="0"
          value={weeklyData.urinationFrequency}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="bloodSugar" className="block text-sm font-medium text-gray-700">Random Blood Sugar</label>
          <span title="Random blood sugar level in mg/dL (if available)" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          id="bloodSugar"
          name="bloodSugar"
          type="number"
          min="0"
          value={weeklyData.bloodSugar}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="appetiteScore" className="block text-sm font-medium text-gray-700">Appetite Score</label>
          <span title="Rate your hunger from 1 (poor) to 5 (very good)" className="text-gray-400 cursor-help">❓</span>
        </div>
        <select
          id="appetiteScore"
          name="appetiteScore"
          value={weeklyData.appetiteScore}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          {[1, 2, 3, 4, 5].map(num => (
            <option key={num} value={num}>{num} - {num === 1 ? 'Poor' : num === 5 ? 'Very Good' : `Level ${num}`}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="dietaryDiversity" className="block text-sm font-medium text-gray-700">Dietary Diversity</label>
          <span title="How many different food groups did you eat yesterday? (0-7)" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          id="dietaryDiversity"
          name="dietaryDiversity"
          type="number"
          min="0"
          max="7"
          value={weeklyData.dietaryDiversity}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="mealFrequency" className="block text-sm font-medium text-gray-700">Meal Frequency</label>
          <span title="How many meals do you eat per day?" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          id="mealFrequency"
          name="mealFrequency"
          type="number"
          min="0"
          value={weeklyData.mealFrequency}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <fieldset className="space-y-2 border border-gray-300 rounded-md p-4">
        <legend className="text-sm font-medium text-gray-700 mb-2">Additional Symptoms</legend>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="swelling" name="swelling" checked={weeklyData.swelling} onChange={e => setWeeklyData(prev => ({ ...prev, swelling: e.target.checked }))} className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
          <label htmlFor="swelling" className="flex items-center gap-2">
            Swelling
            <span title="Did your feet or face swell this week?" className="text-gray-400 cursor-help">❓</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="hairCondition" name="hairCondition" checked={weeklyData.hairCondition} onChange={e => setWeeklyData(prev => ({ ...prev, hairCondition: e.target.checked }))} className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
          <label htmlFor="hairCondition" className="flex items-center gap-2">
            Hair Condition
            <span title="Is your hair thinning or breaking?" className="text-gray-400 cursor-help">❓</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="skinCondition" name="skinCondition" checked={weeklyData.skinCondition} onChange={e => setWeeklyData(prev => ({ ...prev, skinCondition: e.target.checked }))} className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
          <label htmlFor="skinCondition" className="flex items-center gap-2">
            Skin Condition
            <span title="Is your skin dry, cracked, or itchy?" className="text-gray-400 cursor-help">❓</span>
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input type="checkbox" id="slowHealingWounds" name="slowHealingWounds" checked={weeklyData.slowHealingWounds} onChange={e => setWeeklyData(prev => ({ ...prev, slowHealingWounds: e.target.checked }))} className="border border-gray-300 rounded focus:ring-2 focus:ring-blue-500" />
          <label htmlFor="slowHealingWounds" className="flex items-center gap-2">
            Slow-Healing Wounds
            <span title="Do you have any cuts taking longer than usual to heal?" className="text-gray-400 cursor-help">❓</span>
          </label>
        </div>
      </fieldset>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="physicalActivity" className="block text-sm font-medium text-gray-700">Physical Activity</label>
          <span title="Hours of heavy work or walking per day" className="text-gray-400 cursor-help">❓</span>
        </div>
        <input
          id="physicalActivity"
          name="physicalActivity"
          type="number"
          min="0"
          max="24"
          step="0.5"
          value={weeklyData.physicalActivity}
          onChange={handleChange}
          className="input w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />
      </div>

      <button type="submit" className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700">Submit Follow-Up</button>
    </form>
  );
};

export default App;

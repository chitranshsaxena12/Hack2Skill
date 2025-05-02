"use client";
import React, { useState } from "react";
import { MaternalRegistrationForm } from './components/MaternalRegistrationForm';
import { NeonatalRegistrationForm } from './components/NeonatalRegistrationForm';
import { MaternalWeeklyFollowUpForm } from './components/MaternalWeeklyFollowUpForm';
import { NeonatalWeeklyFollowUpForm } from './components/NeonatalWeeklyFollowUpForm';
import { VoiceChat } from './components/VoiceChat';

const App: React.FC = () => {
  const [page, setPage] = useState<string>("main");

  const handleMainSelection = (selection: string) => {
    console.log('handleMainSelection called with:', selection);
    setPage(selection);
    console.log('page state set to:', selection);
  };

  const handleMaternalSelection = (selection: string) => {
    setPage(selection);
  };

  const handleNeonatalSelection = (selection: string) => {
    setPage(selection);
  };

  const handleRegistrationChoice = (type: string) => {
    if (type === "maternal") {
      setPage("maternal-registration");
    } else if (type === "neonatal") {
      setPage("neonatal-registration");
    }
  };

  const handleRegistrationComplete = () => {
    setPage("maternal-weekly");
  };

  const handleNeonatalRegistrationComplete = () => {
    setPage("neonatal-weekly");
  };

  return (
    <div className="mainmenu p-6 min-h-screen flex flex-col items-center justify-center">
      <div className="taskbar">
        <div className="logo">Statskew</div>
      </div>

      {page === "main" && (
        <div className="space-y-6 text-center">
          <h3 className="text-2xl font-bold mb-3">Hi there, Please select an option</h3>
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = 'https://ubiquitous-pancake-4jvw5gr7xx5jhqq4r-5000.app.github.dev/'}
              className="vchat animate-fade px-6 py-3 bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-600"
              title="Click to start voice chat with AI assistant"
            >
              Voice Assistant Chat
            </button>
            <button
              onClick={() => handleMainSelection("registration-choice")}
              className="mmenu animate-fade px-6 py-3 bg-green-500 text-white rounded-xl shadow-md hover:bg-green-600"
              title="Register or submit updates for health monitoring"
            >
              Health Monitoring Section
            </button>
          </div>
        </div>
      )}

      {page === "voice-chat" && <VoiceChat onBack={() => setPage("main")} />}

      {page === "registration-choice" && (
        <div className="page-transition space-y-6 text-center relative">
          <button
            onClick={() => setPage("main")}
            className="fixed top-2 right-20 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-400 z-50"
          >
            Back
          </button>
          <h2 className="text-3xl font-semibold mb-8">Health Monitoring</h2>

          <div className="grid grid-cols-2 gap-8">
            {/* Maternal Health Section */}
            <div className="space-y-4 p-6 bg-purple-50 rounded-xl">
              <h3 className="text-2xl font-semibold text-purple-800 mb-4">Maternal Health</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleRegistrationChoice("maternal")}
                  className="w-full px-6 py-3 bg-purple-500 text-white rounded-xl shadow-md hover:bg-purple-600"
                  title="Register for maternal health monitoring"
                >
                  Maternal Registration
                </button>
                <button
                  onClick={() => setPage("maternal-weekly")}
                  className="w-full px-6 py-3 bg-purple-400 text-white rounded-xl shadow-md hover:bg-purple-500"
                  title="Submit weekly health monitoring updates"
                >
                  Weekly Follow-up
                </button>
              </div>
            </div>

            {/* Neonatal Health Section */}
            <div className="space-y-4 p-6 bg-pink-50 rounded-xl">
              <h3 className="text-2xl font-semibold text-pink-800 mb-4">Neonatal Health</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleRegistrationChoice("neonatal")}
                  className="w-full px-6 py-3 bg-pink-500 text-white rounded-xl shadow-md hover:bg-pink-600"
                  title="Register for neonatal health monitoring"
                >
                  Neonatal Registration
                </button>
                <button
                  onClick={() => setPage("neonatal-weekly")}
                  className="w-full px-6 py-3 bg-pink-400 text-white rounded-xl shadow-md hover:bg-pink-500"
                  title="Submit weekly neonatal updates"
                >
                  Weekly Follow-up
                </button>
                <button
                  onClick={() => window.location.href = 'https://ubiquitous-pancake-4jvw5gr7xx5jhqq4r-5000.app.github.dev/'}
                  className="w-full px-6 py-3 bg-pink-400 text-white rounded-xl shadow-md hover:bg-pink-500"
                  title="Analyze baby's cry"
                >
                  Cry Diagnosis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {page === "maternal-registration" && (
        <div className="page-transition relative w-full">
          <button
            onClick={() => setPage("registration-choice")}
            className="fixed top-2 right-20 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-400 z-50"
          >
            Back
          </button>
          <MaternalRegistrationForm onComplete={handleRegistrationComplete} />
        </div>
      )}

      {page === "neonatal-registration" && (
        <div className="page-transition relative w-full">
          <button
            onClick={() => setPage("registration-choice")}
            className="fixed top-2 right-20 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-400 z-50"
          >
            Back
          </button>
          <NeonatalRegistrationForm onComplete={handleNeonatalRegistrationComplete} />
        </div>
      )}

      {page === "maternal-weekly" && (
        <div className="page-transition relative w-full">
          <button
            onClick={() => setPage("registration-choice")}
            className="fixed top-2 right-20 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-400 z-50"
          >
            Back
          </button>
          <MaternalWeeklyFollowUpForm onBack={() => setPage("registration-choice")} />
        </div>
      )}

      {page === "neonatal-weekly" && (
        <div className="page-transition relative w-full">
          <button
            onClick={() => setPage("registration-choice")}
            className="fixed top-2 right-20 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-400 z-50"
          >
            Back
          </button>
          <NeonatalWeeklyFollowUpForm onBack={() => setPage("registration-choice")} />
        </div>
      )}

      {page === "cry-diagnosis" && (
        <div className="page-transition relative w-full">
          <button
            onClick={() => window.location.href = 'https://ubiquitous-pancake-4jvw5gr7xx5jhqq4r-5001.app.github.dev/'}
            className="fixed top-2 right-20 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-400 z-50"
          >
            Back
          </button>
          {/* CryDiagnosis component will be added here */}
        </div>
      )}
    </div>
  );
};

export default App;

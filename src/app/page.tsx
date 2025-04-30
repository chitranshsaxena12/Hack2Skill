"use client";
import React, { useState } from "react";
import { MaternalRegistrationForm } from './components/MaternalRegistrationForm';
import { MaternalWeeklyFollowUpForm } from './components/MaternalWeeklyFollowUpForm';
import { VoiceChat } from './components/VoiceChat';

const App: React.FC = () => {
  const [page, setPage] = useState<string>("main");

  const handleMainSelection = (selection: string) => {
    console.log('handleMainSelection called with:', selection);
    setPage(selection);
    console.log('page state set to:', selection);
  };

  const handleMaternalSelection = (selection: string) => {
    if (selection === "registration") {
      setPage("maternal-registration");
    } else if (selection === "weekly-followup") {
      setPage("maternal-weekly");
    }
  };

  const handleRegistrationComplete = () => {
    setPage("maternal-weekly");
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
              onClick={() => handleMainSelection("voice-chat")}
              className="vchat animate-fade px-6 py-3 bg-blue-500 text-white rounded-xl shadow-md hover:bg-blue-600"
              title="Click to start voice chat with AI assistant"
            >
              Voice Assistant Chat
            </button>
            <button
              onClick={() => handleMainSelection("maternal-menu")}
              className="mmenu animate-fade px-6 py-3 bg-green-500 text-white rounded-xl shadow-md hover:bg-green-600"
              title="Register or submit weekly updates for maternal health monitoring"
            >
              Maternal Risk Section
            </button>
            <button
              onClick={() => alert("Neonatal Risk Section Coming Soon")}
              className="nmenu animate-fade px-6 py-3 bg-yellow-500 text-white rounded-xl shadow-md hover:bg-yellow-600"
              title="Coming soon: Monitor and track neonatal health risks"
            >
              Neonatal Risk Section
            </button>
          </div>
        </div>
      )}

      {page === "voice-chat" && <VoiceChat onBack={() => setPage("main")} />}

      {page === "maternal-menu" && (
        <div className="page-transition space-y-6 text-center relative">
          <button
            onClick={() => setPage("main")}
            className="fixed top-2 right-20 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-400 z-50"
          >
            Back
          </button>
          <h2 className="text-3xl font-semibold">Maternal Risk Section</h2>
          <div className="space-y-4">
            <button
              onClick={() => handleMaternalSelection("registration")}
              className="mmenu px-6 py-3 bg-purple-500 text-white rounded-xl shadow-md hover:bg-purple-600"
              title="First-time registration for maternal health monitoring"
            >
              Registration (First-Time User)
            </button>
            <button
              onClick={() => handleMaternalSelection("weekly-followup")}
              className="mmenu px-6 py-3 bg-pink-500 text-white rounded-xl shadow-md hover:bg-pink-600"
              title="Submit weekly health updates and receive risk assessment"
            >
              Weekly Follow-Up
            </button>
          </div>
        </div>
      )}

      {page === "maternal-registration" && (
        <div className="page-transition relative w-full">
          <button
            onClick={() => setPage("maternal-menu")}
            className="fixed top-2 right-20 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-400 z-50"
          >
            Back
          </button>
          <MaternalRegistrationForm onComplete={handleRegistrationComplete} />
        </div>
      )}

      {page === "maternal-weekly" && (
        <div className="page-transition relative w-full">
          <button
            onClick={() => setPage("maternal-menu")}
            className="fixed top-2 right-20 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-400 z-50"
          >
            Back
          </button>
          <MaternalWeeklyFollowUpForm onBack={() => setPage("maternal-menu")} />
        </div>
      )}
    </div>
  );
};

export default App;

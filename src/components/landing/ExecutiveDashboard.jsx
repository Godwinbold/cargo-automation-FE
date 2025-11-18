import React from "react";

export default function ExecutivesDashboard() {
  const handleLogin = () => {
    alert("Login functionality would be implemented here");
  };

  return (
    <div
      className="bg-[#f6fbfe]
     flex items-center justify-center p-4 my-20"
    >
      <div className="w-full max-w-4xl border border-[#3DA5E0] bg-white rounded-3xl shadow-lg p-12 md:p-20">
        <div className="text-center space-y-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Executives Dashboard
          </h1>
          <p className="text-base md:text-xl text-gray-600">
            Access and manage all cargo operations
          </p>

          <div className="pt-5">
            <button
              onClick={handleLogin}
              className="w-full max-w-md mx-auto bg-[#3DA5E0] text-white font-semibold text-lg py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

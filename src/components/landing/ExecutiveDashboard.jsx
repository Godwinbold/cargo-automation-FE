import React from "react";
import { Link } from "react-router-dom";

export default function ExecutivesDashboard() {
  return (
    <div
      className="bg-[#f6fbfe]
     flex items-center justify-center p-4 my-20"
    >
      <div className="w-full max-w-4xl border border-[#3DA5E0] bg-white rounded-3xl shadow-lg p-12 md:p-20">
        <div className="text-center space-y-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Administrator Dashboard
          </h1>
          <p className="text-base md:text-xl text-gray-600">
            Access and manage all cargo operations
          </p>

          <div className="pt-5 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/executive-login"
              className="w-full md:text-lg text-base max-w-md mx-auto bg-[#3DA5E0] text-white font-semibold  py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              Login as Executive
            </Link>
            <Link
              to="/admin-login"
              className="w-full max-w-md mx-auto bg-[#3DA5E0] text-white font-semibold md:text-lg text-base py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              Login as Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

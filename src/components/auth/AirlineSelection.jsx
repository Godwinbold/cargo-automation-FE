import React from "react";
import { Link } from "react-router-dom";
import airlineMetadata from "../landing/AirlineMetadata";

const AirlineSelection = ({ airlines, type = "login" }) => {
  return (
    <div className="min-h-screen w-full bg-[url('/images/loginbg.png')] bg-cover bg-center flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20  custom-scrollbar">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 tracking-tight">
            Select Your Airline
          </h1>
          <p className="text-gray-600 font-medium max-w-md mx-auto">
            Choose your airline partner to access the dedicated{" "}
            {type === "login" ? "login" : "registration"} portal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-700 delay-200">
          {airlines && airlines.length > 0 ? (
            airlines.map((airline) => {
              const safeName = airline?.airlineName || "Unknown Airline";
              const metadata = airlineMetadata[safeName] || {
                slug: safeName.toLowerCase().replace(/\s+/g, ""),
                image: "/icons/default.svg",
              };

              const queryParams = new URLSearchParams({
                name: metadata.slug,
                airlineId: airline.id,
              }).toString();

              return (
                <Link
                  key={airline.id}
                  to={`/${type}?${queryParams}`}
                  className="group p-2 bg-white rounded border border-gray-300 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 flex flex-col items-center gap-6 text-center transform hover:-translate-y-1"
                >
                  <div className="w-24 h-24 rounded-xl bg-gray-50 flex items-center justify-center p-5 group-hover:bg-blue-50 group-hover:scale-110 transition-all duration-500 shadow-sm border border-gray-50 group-hover:border-blue-100">
                    <img
                      src={metadata.image}
                      alt={safeName}
                      className="w-full h-full object-contain filter group-hover:brightness-110 transition-all"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 group-hover:text-[#3DA5E0] transition-colors uppercase tracking-wider text-sm">
                      {safeName}
                    </h3>
                    <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-black text-[#3DA5E0] uppercase tracking-[0.2em] transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <span>Access Portal</span>
                      <span className="text-lg">→</span>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500 font-medium">
              No airlines available at this time.
            </div>
          )}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default AirlineSelection;

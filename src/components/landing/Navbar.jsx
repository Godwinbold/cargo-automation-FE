import React, { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [activeAirline, setActiveAirline] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const airlines = [
    "Turkish Airline",
    "Air Cote D'voiure",
    "South African Airways",
    "United Cargo",
    "RwandAir",
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAirlineClick = (airline) => {
    setActiveAirline(airline);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="flex w-full py-1 max-w-5xl md:h-[97px] justify-between px-2 md:pl-[40px] md:pr-[45px] md:rounded-2xl mx-auto items-center bg-white gap-6">
        {/* logo  */}
        <div className="h-[40px] md:h-[61px]  max-w-[154px]">
          <img
            src="/icons/logo.svg"
            alt="Logo"
            className="w-full h-full object-cover md:ml-6"
          />
        </div>

        {/* airline list - desktop */}
        <ul className="hidden lg:flex flex-wrap items-center gap-6">
          {airlines.map((airline, index) => (
            <li
              key={index}
              onClick={() => setActiveAirline(airline)}
              className={`text-sm font-medium cursor-pointer transition-all duration-300 hover:text-[#3DA5E0] relative group ${
                activeAirline === airline ? "text-[#3DA5E0]" : "text-gray-700"
              }`}
            >
              {airline}
              <span
                className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#3DA5E0] transform origin-left transition-transform duration-300 ${
                  activeAirline === airline
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              ></span>
            </li>
          ))}
        </ul>

        {/* hamburger button - mobile */}
        <button
          onClick={toggleMenu}
          className="lg:hidden p-2 text-gray-700 hover:text-[#3DA5E0] transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      </nav>

      {/* mobile menu overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-1000 transition-opacity duration-300 lg:hidden ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMenu}
      ></div>

      {/* mobile menu - sliding from right */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* close button */}
        <div className="flex justify-end p-6">
          <button
            onClick={toggleMenu}
            className="p-2 text-gray-700 hover:text-[#3DA5E0] transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* mobile airline list */}
        <ul className="flex flex-col px-6 gap-4">
          {airlines.map((airline, index) => (
            <li
              key={index}
              onClick={() => handleAirlineClick(airline)}
              className={`text-base font-medium cursor-pointer transition-all duration-300 hover:text-[#3DA5E0] py-3 border-b border-gray-100 ${
                activeAirline === airline ? "text-[#3DA5E0]" : "text-gray-700"
              }`}
            >
              {airline}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Navbar;

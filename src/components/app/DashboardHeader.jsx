import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import { ArrowLeft, Home } from "lucide-react";

const DashboardHeader = ({ mobileMenuOpen, setMobileMenuOpen, name }) => {
  const getPortalName = (name) => {
    const mapping = {
      cotedivoire: "codiv",
      "south-africa": "southafrica",
      rwanda: "rwandair",
    };
    return mapping[name] || name;
  };

  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-white w-full">
      <div className="flex items-center justify-between px-6 py-4 w-full">
     <div className="hidden md:flex "></div>
        <button
          className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Right Side: Notifications and User Menu */}
        <div className="flex items-center space-x-4 ml-4">
   
         
          <div className="w-[1px] h-8 bg-gray-600"></div>
          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
            >
              <img
                src="/icons/person.svg"
                alt="Carl Rice"
                className="w-8 h-8 rounded-full object-cover"
              />

              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {user?.firstName} {user?.lastName}
              </span>
              <svg
                className={`w-4 h-4 text-gray-500 transform transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <Link
                  to={`/change-password?name=${getPortalName(name)}${
                    localStorage.getItem("airlineId")
                      ? `&airlineId=${localStorage.getItem("airlineId")}`
                      : ""
                  }`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Change Password
                </Link>
                <Link
                  to={`/forgot-password?name=${getPortalName(name)}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Forgot Password
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;

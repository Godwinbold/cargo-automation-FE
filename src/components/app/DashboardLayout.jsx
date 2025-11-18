import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";
import DashboardFooter from "./DashboardFooter";

const DashboardLayout = ({ color, name }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* ==================== SIDEBAR - FIXED ON DESKTOP ==================== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          md:translate-x-0
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0  /* Always visible on lg+ even if mobile menu closed */
        `}
      >
        <Sidebar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          color={color}
          name={name}
        />
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Header - full width on mobile, offset on desktop */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
          <DashboardHeader
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 bg-gray-50">
          <div className="px-4 py-6 md:px-8">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white">
          <DashboardFooter color={color} name={name} />
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;

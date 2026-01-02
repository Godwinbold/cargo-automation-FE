import { useState } from "react";
import { Outlet } from "react-router-dom";
import ExecutiveSidebar from "./ExecutiveSidebar";
import ExecutiveHeader from "./ExecutiveHeader";
import ExecutiveFooter from "./ExecutiveFooter";

const ExecutiveLayout = () => {
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
        <ExecutiveSidebar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64">
        {/* Header - Fixed on top */}
        <header
          className={`fixed top-0 right-0 z-20 bg-white border-b border-gray-200 transition-all duration-300 ${
            mobileMenuOpen ? "left-0" : "left-0 md:left-64"
          }`}
        >
          <ExecutiveHeader
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        </header>

        {/* Scrollable Main Content - Add padding top for fixed header */}
        <main className="flex-1 min-h-screen bg-gray-50 pt-[73px]">
          <div className="px-4 py-6 md:px-8">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white">
          <ExecutiveFooter />
        </footer>
      </div>
    </div>
  );
};

export default ExecutiveLayout;

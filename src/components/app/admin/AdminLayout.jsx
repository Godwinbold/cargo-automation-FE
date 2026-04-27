import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import ExecutiveFooter from "../ExecutiveFooter";

const AdminLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out
          bg-white border-r border-gray-200
          ${isCollapsed ? "w-20" : "w-64"}
          transform md:translate-x-0
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <AdminSidebar
          setMobileMenuOpen={setMobileMenuOpen}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div 
        className={`flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <header
          className={`fixed top-0 right-0 z-20 bg-white border-b border-gray-200 transition-all duration-300 ${
            mobileMenuOpen 
              ? "left-0" 
              : `left-0 ${isCollapsed ? "md:left-20" : "md:left-64"}`
          }`}
        >
          <AdminHeader
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
          />
        </header>

        <main className="flex-1 min-h-screen bg-gray-50 pt-[73px]">
          <div className="px-4 py-6 md:px-8">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-gray-200 bg-white">
          <ExecutiveFooter />
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;

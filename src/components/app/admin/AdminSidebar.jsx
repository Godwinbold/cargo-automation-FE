import { Users, Plane, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const AdminSidebar = ({ setMobileMenuOpen, collapsed, setCollapsed }) => {
  const location = useLocation();

  const navItems = [
    {
      to: `/admin-dashboard`,
      label: "Users",
      icon: Users,
    },
    {
      to: `/admin-dashboard/airlines`,
      label: "Airlines",
      icon: Plane,
    },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname === `${path}/`;
  };

  return (
    <div
      className={`h-screen fixed left-0 top-0 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-50 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        <Link
          to={"/"}
          className={`flex items-center ${
            collapsed ? "justify-center w-full" : "space-x-3"
          }`}
        >
          <img
            src={`/icons/logo.svg`}
            alt="Admin"
            className={`transition-all ${
              collapsed ? "h-12 w-12" : "h-[60px] w-[120px]"
            }`}
          />
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden p-2 text-gray-500 hover:text-gray-700"
          aria-label="Close sidebar"
        >
          <X />
        </button>
        {/* Collapse toggle for desktop */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            className={`w-5 h-5 transform transition-transform ${
              collapsed ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      <nav className="flex-1 bg-[#1D81B9] px-3 py-6 space-y-2">
        {navItems.map((item) => {
          const active = isActive(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center rounded-lg py-3 transition-all duration-200 group relative ${
                collapsed ? "justify-center px-0" : "px-4 space-x-3"
              } ${
                active
                  ? `bg-[#FAFAFA] text-[#1D81B9] font-bold shadow-sm`
                  : "text-white hover:bg-gray-50 hover:text-[#1D81B9]"
              }`}
            >
              <div>
                <item.icon />
              </div>

              {!collapsed && (
                <span className="text-sm font-medium truncate">
                  {item.label}
                </span>
              )}

              {collapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60]">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;

import { X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ setMobileMenuOpen, color, name }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation(); // This gets the current URL

  // Define your navigation items
  const navItems = [
    {
      to: `/${name}-dashboard`,
      label: "Financial",
      icon: "/icons/financial.svg",
    },
    {
      to: `/${name}-dashboard/manage-shipping`,
      label: "Manage Shipments",
      icon: "/icons/shipment.svg",
    },
    {
      to: `/${name}-dashboard/document`,
      label: "Documents",
      icon: "/icons/document.svg",
    },
  ];

  // Determine if a menu item is active
  const isActive = (path) => {
    if (path === `/${name}-dashboard`) {
      return (
        location.pathname === `/${name}-dashboard` ||
        location.pathname === `/${name}-dashboard/`
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className={`h-screen fixed left-0 top-0 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo/Header */}
      <div className="p-4  flex items-center justify-between">
        <div
          className={`flex items-center ${
            collapsed ? "justify-center w-full" : "space-x-3"
          }`}
        >
          <img
            src={`/icons/${name}-dash.svg`}
            alt="South Airways"
            className={`transition-all ${
              collapsed ? "h-12 w-12" : "h-[60px] w-[120px]"
            }`}
          />
        </div>

        <button className="md:hidden">
          <X onClick={() => setMobileMenuOpen(false)} />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {navItems.map((item) => {
          const active = isActive(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center rounded-lg py-3 transition-all duration-200 group ${
                collapsed ? "justify-center px-0" : "px-4 space-x-3"
              } ${
                active
                  ? `bg-[#FAFAFA] font-bold shadow-sm`
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              style={{ color: active ? color : "" }}
            >
              <div className="relative">
                <img
                  src={item.icon}
                  alt={item.label}
                  className={`h-5 w-5 ${
                    active ? "filter brightness-0 saturate-100" : ""
                  }`}
                  style={
                    active
                      ? {
                          filter:
                            "brightness(0) saturate-100% invert(16%) sepia(87%) saturate(7414%) hue-rotate(202deg) brightness(96%) contrast(101%)",
                        }
                      : {}
                  }
                />
              </div>

              {!collapsed && (
                <span className="text-sm font-medium truncate">
                  {item.label}
                </span>
              )}

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
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

export default Sidebar;

import React from "react";
import { Plus } from "lucide-react";

export default function Create({
  icon,
  title,
  description,
  btnAction,
  onClick,
  color,
}) {
  return (
    <div className=" flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Illustration Container */}
        <div className="relative mb-2">
          {/* Main Illustration Area */}
          <div className="relative p-2 mt-10 mx-auto max-w-xs">
            {/* Person Illustration */}
            <div className="flex items-start gap-4 mb-4">
              <img src={`/images/${icon}`} alt={icon} />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-2">
          <h2 className="text-base font-bold text-gray-900 mb-1">{title}</h2>
          <p className="text-gray-500 max-w-xs mx-auto text-xs">
            {description}
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={onClick}
          style={{ backgroundColor: color }}
          className=" mx-auto mt-4 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          {btnAction}
        </button>
      </div>
    </div>
  );
}

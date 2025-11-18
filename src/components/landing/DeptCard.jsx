import { ArrowRight } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const DeptCard = ({ title, image, link }) => {
  return (
    <div className="flex flex-col py-4 gap-6 border border-gray-400 rounded-[20px]">
      <img
        src={image}
        alt={title}
        className="w-[100px] mx-auto h-[100px] object-cover rounded-t-lg"
      />
      <div className="p-4 flex items-center flex-col justify-center">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>

        <Link
          to={link}
          className="flex text-sm text-gray-600 gap-2 items-center"
        >
          Access Portal <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default DeptCard;

import React from "react";
import DeptCard from "./DeptCard";

const AirlinePartners = () => {
  return (
    <div className="max-w-4xl px-4 mt-10 my-3 mx-auto">
      <div className="py-4">
        <h1 className="font-semibold text-xl text-center mt-2">
          Airline Cargo Partners
        </h1>
        <p className="text-sm text-center max-w-2xl mx-auto">
          Access dedicated cargo names for our partner airlines with real-time
          tracking and management tools
        </p>
      </div>

      <div className="grid grid-cols-1  sm:grid-cols-2 gap-10 md:gap-16 mt-5">
        <DeptCard
          title="Turkish Airlines Cargo"
          image="/icons/turkish.svg"
          link="/login?name=turkish"
        />
        <DeptCard
          title="Turkish Airlines Cargo"
          image="/icons/rwandair.svg"
          link="/login?name=rwandair"
        />
        <DeptCard
          title="Turkish Airlines Cargo"
          image="/icons/united.svg"
          link="/login?name=united"
        />
        <DeptCard
          title="Turkish Airlines Cargo"
          image="/icons/south-africa.svg"
          link="/login?name=southafrica"
        />
        <div className="flex sm:col-span-2 md:justify-center">
          <div className="w-full md:w-1/2 lg:w-1/2">
            <DeptCard
              title="Turkish Airlines Cargo"
              image="/icons/codiv.svg"
              link="/login?name=codiv"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirlinePartners;

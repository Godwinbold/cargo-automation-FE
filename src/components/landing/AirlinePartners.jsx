import React from "react";
import DeptCard from "./DeptCard";
import airlineMetadata from "./AirlineMetadata";

const SkeletonDeptCard = () => (
  <div className="flex flex-col py-4 gap-6 border border-gray-200 rounded-[20px] animate-pulse">
    <div className="w-[100px] mx-auto h-[100px] bg-gray-200 rounded-full" />
    <div className="p-4 flex items-center flex-col justify-center gap-3">
      <div className="h-6 w-32 bg-gray-200 rounded" />
      <div className="h-4 w-24 bg-gray-200 rounded" />
    </div>
  </div>
);

const AirlinePartners = ({ data, isPending, isError }) => {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-16 mt-5">
        {isPending || isError
          ? Array.from({ length: 4 }).map((_, i) => (
              <SkeletonDeptCard key={i} />
            ))
          : data.map((airline, index) => {
              const metadata = airlineMetadata[airline.airlineName] || {
                slug: airline.airlineName.toLowerCase().replace(/\s+/g, ""),
                image: "/icons/default.svg",
              };

              const isLastItem = index === data.length - 1 && index % 2 === 0;

              const cardContent = (
                <DeptCard
                  key={airline.id}
                  title={airline.airlineName}
                  image={metadata.image}
                  link={`/login?name=${metadata.slug}&airlineId=${airline.id}`}
                />
              );

              if (isLastItem) {
                return (
                  <div
                    key={airline.id}
                    className="flex sm:col-span-2 md:justify-center"
                  >
                    <div className="w-full md:w-1/2 lg:w-1/2">
                      {cardContent}
                    </div>
                  </div>
                );
              }

              return cardContent;
            })}
      </div>
    </div>
  );
};

export default AirlinePartners;

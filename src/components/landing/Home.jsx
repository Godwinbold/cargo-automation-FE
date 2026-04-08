import React from "react";
import Navbar from "./Navbar";
import MainText from "./MainText";
import AirlinePartners from "./AirlinePartners";
import ExecutivesDashboard from "./ExecutiveDashboard";
import Footer from "../Footer";
import { useGetAllAirlines } from "../../hooks/useGeneral";

const Home = () => {
  const { data: response, isPending, isError } = useGetAllAirlines();
  const airlines = response?.data || [];
  return (
    <div>
      <div className="py-[20px] md:py-[31px] h-[80vh] bg-[linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)),url('/images/bg.png')] bg-cover bg-center px-3 ">
        {/* Navigation bar */}
        <Navbar airlines={airlines} isPending={isPending} isError={isError} />
        {/* main text  */}
        <MainText />
      </div>
      <AirlinePartners
        data={airlines}
        isPending={isPending}
        isError={isError}
      />
      <ExecutivesDashboard />
      <Footer />
    </div>
  );
};

export default Home;

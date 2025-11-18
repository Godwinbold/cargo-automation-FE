import React from "react";
import Navbar from "./Navbar";
import MainText from "./MainText";
import AirlinePartners from "./AirlinePartners";
import ExecutivesDashboard from "./ExecutiveDashboard";
import Footer from "../footer";

const Home = () => {
  return (
    <div>
      <div className="py-[20px] md:py-[51px] h-[80vh] bg-[linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)),url('/images/bg.png')] bg-cover bg-center px-3 ">
        {/* Navigation bar */}
        <Navbar />
        {/* main text  */}
        <MainText />
      </div>
      <AirlinePartners />
      <ExecutivesDashboard />
      <Footer />
    </div>
  );
};

export default Home;
